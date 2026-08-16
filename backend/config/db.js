require('dotenv').config();
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require('@prisma/client');

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({
    connectionString: connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,  // increase to 10s to handle Neon cold starts
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: true }
        : false,
})

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

prisma.$connect()
    .then(() => console.log('✓ Database connected'))
    .catch((e) => {
        console.error('✗ Database connection failed:', e.message)
        process.exit(1)  // crash fast so Render restarts the service
    })

module.exports = prisma;