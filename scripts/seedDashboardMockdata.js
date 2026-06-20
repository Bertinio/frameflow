const { PrismaClient, Prisma } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const DEMO_EMAIL = 'installer@test.local';
const DEMO_PASSWORD = 'TestPass123!';

function dec(value) {
  return new Prisma.Decimal(value.toFixed(2));
}

function quoteItem(type, width, height, color, glass, options, unitPrice) {
  const totalPrice = dec(Number(unitPrice));

  return {
    type,
    width,
    height,
    color,
    glass,
    options,
    unitPrice: dec(Number(unitPrice)),
    totalPrice,
  };
}

function orderItem(type, width, height, color, glass, options, unitPrice, quantity = 1) {
  const totalPrice = dec(Number(unitPrice) * quantity);

  return {
    type,
    width,
    height,
    color,
    glass,
    options,
    quantity,
    profileType: 'Standaard',
    unitPrice: dec(Number(unitPrice)),
    totalPrice,
  };
}

async function main() {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const installer = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {
      passwordHash: hash,
      role: 'installer',
      name: 'Demo Installateur',
      margin: new Prisma.Decimal(0.18),
    },
    create: {
      email: DEMO_EMAIL,
      passwordHash: hash,
      role: 'installer',
      name: 'Demo Installateur',
      margin: new Prisma.Decimal(0.18),
    },
  });

  const quoteIds = await prisma.quote.findMany({
    where: { installerId: installer.id },
    select: { id: true },
  });
  const orderIds = await prisma.order.findMany({
    where: { installerId: installer.id },
    select: { id: true },
  });

  if (quoteIds.length) {
    await prisma.quoteItem.deleteMany({
      where: { quoteId: { in: quoteIds.map((quote) => quote.id) } },
    });
    await prisma.quote.deleteMany({
      where: { id: { in: quoteIds.map((quote) => quote.id) } },
    });
  }

  if (orderIds.length) {
    await prisma.orderItem.deleteMany({
      where: { orderId: { in: orderIds.map((order) => order.id) } },
    });
    await prisma.order.deleteMany({
      where: { id: { in: orderIds.map((order) => order.id) } },
    });
  }

  const now = Date.now();
  const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now - 2 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

  const quotes = [
    {
      status: 'DRAFT',
      createdAt: threeDaysAgo,
      totalPrice: dec(1180.5),
      items: [
        quoteItem('draairaam', 1200, 1400, 'Wit', 'HR++', 'Hor', 1180.5),
      ],
    },
    {
      status: 'SUBMITTED',
      createdAt: twoDaysAgo,
      totalPrice: dec(2460.25),
      items: [
        quoteItem('schuifraam', 2400, 2100, 'Antraciet', 'Dubbel glas', 'Rooster', 2460.25),
      ],
    },
    {
      status: 'DRAFT',
      createdAt: oneDayAgo,
      totalPrice: dec(1695.9),
      items: [
        quoteItem('deur', 1000, 2200, 'Zwart', 'Gelaagd', 'Ventilatierooster', 1695.9),
      ],
    },
  ];

  for (const quoteData of quotes) {
    await prisma.quote.create({
      data: {
        installerId: installer.id,
        status: quoteData.status,
        totalPrice: quoteData.totalPrice,
        createdAt: quoteData.createdAt,
        items: {
          create: quoteData.items,
        },
      },
    });
  }

  const orders = [
    {
      status: 'in_behandeling',
      createdAt: twoDaysAgo,
      totalPrice: dec(2285.75),
      items: [
        orderItem('draairaam', 1100, 1300, 'Wit', 'HR++', 'Hor', 1142.88),
        orderItem('kipraam', 900, 1200, 'Wit', 'HR++', 'Geen', 1142.87),
      ],
    },
    {
      status: 'geproduceerd',
      createdAt: oneDayAgo,
      totalPrice: dec(3499.4),
      items: [
        orderItem('schuifraam', 2600, 2200, 'Antraciet', 'Dubbel glas', 'Rooster', 3499.4),
      ],
    },
  ];

  for (const orderData of orders) {
    await prisma.order.create({
      data: {
        installerId: installer.id,
        status: orderData.status,
        totalPrice: orderData.totalPrice,
        createdAt: orderData.createdAt,
        items: {
          create: orderData.items,
        },
      },
    });
  }

  console.log(`Mockdata created for ${DEMO_EMAIL}: 3 quotes and 2 orders.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
