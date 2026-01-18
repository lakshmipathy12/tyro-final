const prisma = require('../utils/prismaClient');

exports.createPermission = async (req, res) => {
    try {
        const { type, reason, fromDate, toDate } = req.body;
        const userId = req.user.id;

        const newPermission = await prisma.permission.create({
            data: {
                userId,
                type,
                reason,
                fromDate: new Date(fromDate),
                toDate: new Date(toDate),
                status: 'Pending'
            }
        });

        res.status(201).json({ status: 'success', data: newPermission });
    } catch (error) {
        console.error('Create Permission Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getMyPermissions = async (req, res) => {
    try {
        const userId = req.user.id;
        const permissions = await prisma.permission.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ status: 'success', data: permissions });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getAllPermissions = async (req, res) => {
    try {
        // Admin only
        const permissions = await prisma.permission.findMany({
            include: { user: { select: { name: true, employeeId: true } } }, // Include user details
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ status: 'success', data: permissions });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updatePermissionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Approved or Rejected
        const adminId = req.user.id;

        const updatedPermission = await prisma.permission.update({
            where: { id },
            data: {
                status,
                approvedBy: adminId
            },
            include: { user: { select: { id: true, name: true } } }
        });

        // Auto-post Announcement to the user
        await prisma.announcement.create({
            data: {
                senderId: adminId,
                recipientId: updatedPermission.userId,
                target: 'Individual',
                title: `Permission ${status}`,
                message: `Your request for ${updatedPermission.type} has been ${status.toLowerCase()} by the administration.`
            }
        });

        // Loophole: If accepted, should we update attendance? 
        // For now, we just update the status as per requirements. 
        // Logic to insert "Leave" into attendance table for those dates can be complex 
        // (handling date ranges), keeping it simple for now.

        res.status(200).json({ status: 'success', data: updatedPermission });
    } catch (error) {
        console.error("Update Permission Error:", error);
        res.status(500).json({ message: 'Error updating status: ' + (error.message || 'Internal error') });
    }
};
