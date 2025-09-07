// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('adminpass', 10);
  const userPassword = await bcrypt.hash('userpass', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      phone: '0000000000',
      passwordHash,
      role: 'ADMIN'
    }
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      name: 'Regular User',
      email: 'user@example.com',
      phone: '1111111111',
      passwordHash: userPassword,
      role: 'USER'
    }
  });

  const restaurant = await prisma.restaurant.upsert({
    where: { name: 'Sample Bistro' },
    update: {},
    create: {
      name: 'Sample Bistro',
      address: '123 Main St',
      city: 'Sample City',
      ownerId: admin.id,
      openingTime: '10:00',
      closingTime: '22:00'
    }
  });

  await prisma.restaurantTable.createMany({
    data: [
      { restaurantId: restaurant.id, label: 'T1', seats: 2 },
      { restaurantId: restaurant.id, label: 'T2', seats: 4 },
      { restaurantId: restaurant.id, label: 'T3', seats: 6 }
    ]
  });

  console.log('Seed done');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
