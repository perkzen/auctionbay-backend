import { PrismaClient } from '@prisma/client';

export const cleanupDatabase = async (prisma: PrismaClient) => {
  try {
    await prisma.bid.deleteMany();
    await prisma.auction.deleteMany();
    await prisma.user.deleteMany();
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
};
