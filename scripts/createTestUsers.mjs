import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

async function main() {
  const prisma = new PrismaClient();
  const password = 'TestPass123!';
  const hash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email: 'admin@test.local' },
    update: { passwordHash: hash, role: 'admin' },
    create: { email: 'admin@test.local', passwordHash: hash, role: 'admin' },
  });

  await prisma.user.upsert({
    where: { email: 'installer@test.local' },
    update: { passwordHash: hash, role: 'installer' },
    create: { email: 'installer@test.local', passwordHash: hash, role: 'installer' },
  });

  console.log('Test users ensured: admin@test.local, installer@test.local (password: TestPass123!)');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
