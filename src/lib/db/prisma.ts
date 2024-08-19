import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

const PrismaClientSingleton = () => {
    return new PrismaClient().$extends(withAccelerate());
};

type PrismaClientSingleton = ReturnType<typeof PrismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
}

const prisma = globalForPrisma.prisma ?? PrismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV != "production") globalForPrisma.prisma = prisma;