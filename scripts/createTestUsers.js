const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

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

  await prisma.user.upsert({
    where: { email: 'importer@test.local' },
    update: { passwordHash: hash, role: 'importer' },
    create: { email: 'importer@test.local', passwordHash: hash, role: 'importer' },
  });

  console.log('Test users ensured: admin@test.local, installer@test.local, importer@test.local (password: TestPass123!)');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
