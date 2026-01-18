const prisma = require('../utils/prismaClient');

exports.createAnnouncement = async (req, res) => {
    try {
        const { message, target, recipientId, recipientEmail, title } = req.body;
        const senderId = req.user.id;
        let finalRecipientId = recipientId;

        if (target === 'Individual' && recipientEmail) {
            const user = await prisma.user.findUnique({ where: { email: recipientEmail } });
            if (!user) {
                return res.status(404).json({ message: 'Recipient user not found' });
            }
            finalRecipientId = user.id;
        }

        const announcement = await prisma.announcement.create({
            data: {
                senderId,
                message,
                target: target || 'All', // 'All' or 'Individual'
                recipientId: finalRecipientId || null,
                title: title || 'Notice'
            }
        });

        res.status(201).json({ status: 'success', data: announcement });
    } catch (error) {
        console.error("Create Announcement Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAnnouncements = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch announcements targeting 'All' OR specifically this user
        const announcements = await prisma.announcement.findMany({
            where: {
                OR: [
                    { target: 'All' },
                    { recipientId: userId }
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: { sender: { select: { name: true } } }
        });

        res.status(200).json({ status: 'success', data: announcements });
    } catch (error) {
        console.error("Fetch Announcements Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
