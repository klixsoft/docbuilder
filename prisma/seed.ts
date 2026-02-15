import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
        await pool.end();
    });
