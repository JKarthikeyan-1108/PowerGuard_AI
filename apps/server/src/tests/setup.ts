import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Can add global test DB setup here
});

afterAll(async () => {
  await prisma.$disconnect();
});
