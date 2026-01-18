const prisma = require('../utils/prismaClient');
const { getDistance } = require('../utils/geoUtils'); // We will create this helper

const OFFICE_LOCATIONS = [
    { lat: 13.119129, lng: 80.15127, name: 'Main Office' },
    { lat: 13.1068797, lng: 79.9229042, name: 'Secondary Office' }
];
const OFFICE_RADIUS_METERS = 100;

exports.clockIn = async (req, res) => {
    try {
        const userId = req.user.id; // From authMiddleware
        const { mode, location } = req.body; // mode: 'Office' | 'Remote'

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already clocked in
        const existingAttendance = await prisma.attendance.findUnique({
            where: {
                userId_date: {
                    userId,
                    date: today,
                },
            },
        });

        if (existingAttendance) {
            return res.status(400).json({ message: 'You have already clocked in for today.' });
        }

        // Geofencing Check for Office
        if (mode === 'Office') {
            if (!location || !location.lat || !location.lng) {
                return res.status(400).json({ message: 'Location data required for Office check-in.' });
            }

            // Check distance against all allowed office locations
            let isWithinRange = false;
            let minDistance = Infinity;

            for (const office of OFFICE_LOCATIONS) {
                const distance = getDistance(
                    location.lat, location.lng,
                    office.lat, office.lng
                );
                minDistance = Math.min(minDistance, distance);
                if (distance <= OFFICE_RADIUS_METERS) {
                    isWithinRange = true;
                    break;
                }
            }

            if (!isWithinRange) {
                return res.status(400).json({
                    message: `You are too far from any office (${Math.round(minDistance)}m). Max allowed: ${OFFICE_RADIUS_METERS}m`
                });
            }
        }

        // Late Check (after 9:00 AM)
        const now = new Date();
        const isLate = (now.getHours() > 9) || (now.getHours() === 9 && now.getMinutes() > 0);

        const attendance = await prisma.attendance.create({
            data: {
                userId,
                date: today,
                loginTime: now,
                status: isLate ? 'Half_Day' : 'Present', // Or just Present but marked late. Requirement says "status (Present / Absent / Half_Day / Leave)". Usually Late doesn't mean Half Day immediately, but let's stick to simple logic or just mark isLate.
                // Actually prompt says "isLate (boolean)". Status should probably be Present.
                // Let's set Status to Present for now, Half_Day logic might be manual or hours based.
                status: 'Present',
                isLate,
                workMode: mode, // Office or Remote
            },
        });

        res.status(200).json({
            status: 'success',
            data: attendance,
        });

    } catch (error) {
        console.error('Clock-in error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.clockOut = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await prisma.attendance.findUnique({
            where: {
                userId_date: {
                    userId,
                    date: today,
                },
            },
        });

        if (!attendance) {
            return res.status(400).json({ message: 'No active attendance record found for today.' });
        }

        if (attendance.logoutTime) {
            return res.status(400).json({ message: 'You have already clocked out.' });
        }

        const now = new Date();

        // Calculate Total Hours
        const loginTime = new Date(attendance.loginTime);
        const diffMs = now - loginTime;
        const totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

        const updatedAttendance = await prisma.attendance.update({
            where: { id: attendance.id },
            data: {
                logoutTime: now,
                totalHours: totalHours
            }
        });

        res.status(200).json({
            status: 'success',
            data: updatedAttendance
        });

    } catch (error) {
        console.error('Clock-out error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getTodayAttendance = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await prisma.attendance.findUnique({
            where: {
                userId_date: {
                    userId,
                    date: today,
                },
            },
        });

        res.status(200).json({
            status: 'success',
            data: attendance || null // null means not clocked in yet
        });
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getAttendanceReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Default to today if no range provided
        const start = startDate ? new Date(startDate) : new Date();
        start.setHours(0, 0, 0, 0);

        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999);

        // 1. Fetch all attendance records in range
        const attendances = await prisma.attendance.findMany({
            where: {
                date: {
                    gte: start,
                    lte: end
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        employeeId: true,
                        department: true,
                        designation: true, // Needed for comprehensive reports
                        joiningDate: true
                    }
                }
            },
            orderBy: {
                date: 'desc' // Newest first
            }
        });

        // 2. Fetch all Approved Permissions in range
        const permissions = await prisma.permission.findMany({
            where: {
                status: 'Approved',
                OR: [
                    {
                        startDate: { lte: end },
                        endDate: { gte: start }
                    }
                ]
            }
        });

        // 3. Fetch All Users to calculate Absenteeism
        const allUsers = await prisma.user.findMany({
            select: { id: true, name: true, employeeId: true, role: true }
        });

        // 4. Calculate Stats Per User
        // We'll map each user to their stats
        const userStats = {};

        // Initialize everyone with 0
        allUsers.forEach(user => {
            if (user.role !== 'Admin') { // Optionally exclude super admins if needed, but let's keep all
                userStats[user.id] = {
                    user: user,
                    present: 0,
                    halfDay: 0,
                    late: 0,
                    permissions: 0,
                    absent: 0, // We will calculate this roughly or leave for advanced logic
                    totalHours: 0
                };
            }
        });

        // Aggregate Attendance
        attendances.forEach(record => {
            if (userStats[record.userId]) {
                userStats[record.userId].present += 1; // Basic count
                userStats[record.userId].totalHours += (record.totalHours || 0);

                if (record.isLate) userStats[record.userId].late += 1;
                if (record.status === 'Half_Day') userStats[record.userId].halfDay += 1;
            }
        });

        // Aggregate Permissions
        // Keep it simple: if you have a permission overlapping the range, we count it
        // Correct logic requires checking day-by-day, but for summary:
        permissions.forEach(perm => {
            if (userStats[perm.userId]) {
                userStats[perm.userId].permissions += 1;
            }
        });

        // Calculate "Absent" (Very rough approximation: Days Passed - Present - Permissions)
        // This is complex because of weekends/holidays. For now, we'll return the raw counts 
        // and let the frontend show "Present: X, Permission: Y". "Absent" is dangerous to guess without holiday calendar.

        // Convert map to array
        const summary = Object.values(userStats);

        res.status(200).json({
            status: 'success',
            range: { start, end },
            results: attendances.length,
            summary: summary,
            data: attendances
        });

    } catch (error) {
        console.error('Report Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
