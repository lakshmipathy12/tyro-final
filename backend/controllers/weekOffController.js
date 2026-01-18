const prisma = require('../utils/prismaClient');

exports.getWeekOffs = async (req, res) => {
    try {
        // Return all week offs with user details
        const weekOffs = await prisma.weekOff.findMany({
            include: { user: { select: { name: true, employeeId: true } } }
        });
        res.status(200).json({ status: 'success', data: weekOffs });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.assignWeekOff = async (req, res) => {
    try {
        const { userId, dayOfWeek, type } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User selection is required' });
        }

        // Check if user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Check if already assigned for this day
        const existing = await prisma.weekOff.findFirst({
            where: { userId, dayOfWeek: parseInt(dayOfWeek) }
        });

        if (existing) {
            return res.status(400).json({ message: `Week-off for this day is already assigned to ${user.name}.` });
        }

        const newWeekOff = await prisma.weekOff.create({
            data: {
                userId,
                dayOfWeek: parseInt(dayOfWeek),
                type // 'Full Day', 'Alternate'
            }
        });

        // Auto-post Announcement to the user
        const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        await prisma.announcement.create({
            data: {
                senderId: req.user.id,
                recipientId: userId,
                target: 'Individual',
                title: 'Week-Off Assigned',
                message: `You have been assigned a ${type} week-off on every ${DAYS[parseInt(dayOfWeek)]}.`
            }
        });

        res.status(201).json({ status: 'success', data: newWeekOff });

    } catch (error) {
        console.error("Assign WeekOff Error:", error);
        res.status(500).json({ message: error.message || 'Internal server error while assigning week-off' });
    }
};

exports.deleteWeekOff = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.weekOff.delete({ where: { id } });
        res.status(200).json({ status: 'success' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
