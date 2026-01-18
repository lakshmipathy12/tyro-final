const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://neondb_owner:npg_ihsQ7nYFlwx1@ep-bitter-silence-a1lhx8bn-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
        },
    },
});

async function createAdmin() {
    console.log("🚀 Connectig to Cloud Database...");

    const email = 'admin@tyro.com';
    const password = 'admin123';

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    try {
        const user = await prisma.user.create({
            data: {
                name: 'Super Admin',
                email: email,
                password: hashedPassword,
                employeeId: 'ADMIN-001', // Manually setting this to fix the error
                role: 'Admin',
                department: 'Administration',
                designation: 'System Owner',
                employeeType: 'Full-Time',
                // Add dummy date to satisfy schema if needed
                joiningDate: new Date(),
                dob: new Date(),
                sex: 'Male',
                address: 'HQ'
            }
        });

        console.log("\n✅ SUCCESS! Admin Account Created.");
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);
        console.log("\n👉 You can now go to https://tyro-final.vercel.app/login and log in!");

    } catch (e) {
        if (e.code === 'P2002') {
            console.log("\n⚠️  User already exists! You can just log in with admin@tyro.com");
        } else {
            console.error("\n❌ Error:", e);
        }
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
