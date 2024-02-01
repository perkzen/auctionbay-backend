import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  for (let i = 0; i < 10; i++) {
    await prisma.user.create({
      data: {
        email: faker.internet.email(),
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        password: faker.internet.password(),
      },
    });
  }
}

(async () => {
  try {
    await main();
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
})();
