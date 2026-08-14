require('dotenv').config();
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require('@prisma/client');

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({
    connectionString: connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
})

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

module.exports = prisma;