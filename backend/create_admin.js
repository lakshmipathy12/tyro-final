const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@tyro.com';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log(`Attempting to connect to: ${process.env.DATABASE_URL.split('@')[1]}`); // Log host for debugging (mask auth)

    try {
        const admin = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                name: 'Super Admin',
                password: hashedPassword,
                employeeId: 'ADM001',
                role: 'Admin',
                department: 'Management',
                designation: 'System Administrator'
            },
        });
        console.log('-------------------------------------------');
        console.log('✅ Admin User Created Successfully!');
        console.log('📧 Email:    ' + email);
        console.log('🔑 Password: ' + password);
        console.log('-------------------------------------------');
    } catch (e) {
        console.error('Error creating admin:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
