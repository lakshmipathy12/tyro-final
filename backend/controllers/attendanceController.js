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

exports.getDailyReport = async (req, res) => {
    try {
        const { date } = req.query;
        // Ensure date is parsed correctly at 00:00:00 local or UTC depending on storing strategy
        // Here assuming ISO string YYYY-MM-DD
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        const attendances = await prisma.attendance.findMany({
            where: {
                date: targetDate
            },
            include: {
                user: {
                    select: {
                        name: true,
                        employeeId: true,
                        department: true,
                        designation: true
                    }
                }
            },
            orderBy: {
                loginTime: 'asc'
            }
        });

        res.status(200).json({
            status: 'success',
            results: attendances.length,
            data: attendances
        });

    } catch (error) {
        console.error('Daily Report Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
