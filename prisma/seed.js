const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('Practet00@', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'info@klixsoft.com' },
        update: {},
        create: {
            email: 'info@klixsoft.com',
            name: 'Klix soft',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    console.log('Admin user created:', admin);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
