const prisma = require('../utils/prismaClient');

exports.getDashboardStats = async (req, res) => {
    let stats = {
        totalUsers: 0,
        activeToday: 0,
        officeToday: 0,
        remoteToday: 0,
        lateToday: 0,
        absentToday: 0,
        onLeaveToday: 0,
        weekOffToday: 0,
        pendingPermissions: 0,
        recentActivity: []
    };
    let errorLog = [];

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Total Workforce
        try {
            stats.totalUsers = await prisma.user.count({
                where: {
                    role: { in: ['Employee', 'HR_Admin', 'Admin', 'Manager_Admin'] }
                }
            });
        } catch (e) { errorLog.push(`Total Workforce: ${e.message}`); }

        // 2. Present Today
        try {
            stats.activeToday = await prisma.attendance.count({
                where: { date: today, OR: [{ status: 'Present' }, { status: 'Half_Day' }] }
            });
        } catch (e) { errorLog.push(`Active Today: ${e.message}`); }

        // 3. Work Modes (Might fail if columns missing)
        try {
            stats.officeToday = await prisma.attendance.count({
                where: { date: today, workMode: 'Office', OR: [{ status: 'Present' }, { status: 'Half_Day' }] }
            });
            stats.remoteToday = await prisma.attendance.count({
                where: { date: today, workMode: 'Remote', OR: [{ status: 'Present' }, { status: 'Half_Day' }] }
            });
        } catch (e) { errorLog.push(`Work Modes: ${e.message}`); }

        // 4. Late Logins
        try {
            stats.lateToday = await prisma.attendance.count({ where: { date: today, isLate: true } });
        } catch (e) { errorLog.push(`Late Logins: ${e.message}`); }

        // 5. On Leave Today
        try {
            stats.onLeaveToday = await prisma.permission.count({
                where: { status: 'Approved', type: 'Leave', fromDate: { lte: today }, toDate: { gte: today } }
            });
        } catch (e) { errorLog.push(`Leaves: ${e.message}`); }

        // 6. Week-offs
        try {
            const dayOfWeek = today.getDay();
            stats.weekOffToday = await prisma.weekOff.count({ where: { dayOfWeek } });
        } catch (e) { errorLog.push(`WeekOffs: ${e.message}`); }

        // 7. Absent Calculation
        stats.absentToday = Math.max(0, stats.totalUsers - stats.activeToday - stats.onLeaveToday - stats.weekOffToday);

        // 8. Pending Requests
        try {
            stats.pendingPermissions = await prisma.permission.count({ where: { status: 'Pending' } });
        } catch (e) { errorLog.push(`Pending: ${e.message}`); }

        // 9. Recent Activity
        try {
            const limit = parseInt(req.query.limit) || 10;
            const skip = parseInt(req.query.skip) || 0;
            stats.recentActivity = await prisma.attendance.findMany({
                where: { date: today },
                orderBy: { loginTime: 'desc' },
                take: limit,
                skip: skip,
                include: { user: { select: { name: true, employeeId: true, profileImage: true, designation: true } } }
            });
            const totalRecent = await prisma.attendance.count({ where: { date: today } });
            stats.pagination = {
                total: totalRecent,
                limit,
                skip,
                hasMore: skip + limit < totalRecent
            };
        } catch (e) { errorLog.push(`Recent Activity: ${e.message}`); }

        if (errorLog.length > 0) {
            console.warn("Partial Dashboard Stats Errors:", errorLog);
        }

        res.status(200).json({
            status: 'success',
            data: stats,
            messages: errorLog.length > 0 ? errorLog : undefined
        });

    } catch (error) {
        console.error('Fatal Admin Stats Error:', error);
        res.status(500).json({
            message: 'A critical error occurred while generating statistics',
            details: error.message,
            log: errorLog
        });
    }
};

exports.getAllEmployees = async (req, res) => {
    try {
        const employees = await prisma.user.findMany({
            where: {}, // Fetch all users for management
            select: {
                id: true,
                employeeId: true,
                name: true,
                email: true,
                department: true,
                designation: true,
                role: true,
                dob: true,
                sex: true,
                address: true,
                employeeType: true,
                joiningDate: true,
                shiftTime: true,
                profileImage: true,
                createdAt: true
            }
        });

        res.status(200).json({ status: 'success', data: employees });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employees' });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name, email, role, department, designation, employeeId,
            dob, sex, address, employeeType, joiningDate, shiftTime, profileImage
        } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                name,
                email,
                role,
                department,
                designation,
                employeeId,
                dob: dob ? new Date(dob) : undefined,
                sex,
                address,
                employeeType,
                joiningDate: joiningDate ? new Date(joiningDate) : undefined,
                shiftTime,
                profileImage
            }
        });

        res.status(200).json({ status: 'success', data: updatedUser });
    } catch (error) {
        console.error("Update Employee Error", error);
        res.status(500).json({ message: 'Error updating employee' });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.id === id) {
            return res.status(400).json({ message: 'You cannot delete yourself.' });
        }

        // Transactions to delete all related data first
        await prisma.$transaction([
            prisma.attendance.deleteMany({ where: { userId: id } }),
            prisma.permission.deleteMany({ where: { userId: id } }),
            prisma.weekOff.deleteMany({ where: { userId: id } }),
            prisma.announcement.deleteMany({ where: { OR: [{ senderId: id }, { recipientId: id }] } }),
            prisma.user.delete({ where: { id } })
        ]);

        res.status(200).json({ status: 'success', message: 'Employee and all related data deleted successfully' });
    } catch (error) {
        console.error("Delete Employee Error", error);
        res.status(500).json({ message: 'Error deleting employee: Cascaded records found' });
    }
};
