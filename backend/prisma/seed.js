const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const userPassword = await bcrypt.hash('userpass', 10);
  const ownerPassword = await bcrypt.hash('ownerpass', 10);

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

  const restaurantOwner = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      name: 'Restaurant Owner',
      email: 'owner@example.com',
      phone: '2222222222',
      passwordHash: ownerPassword,
      role: 'RESTAURANT_OWNER'
    }
  });


  const adminPassword = await bcrypt.hash('adminpass', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { role: 'RESTAURANT_OWNER' },
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      phone: '0000000000',
      passwordHash: adminPassword,
      role: 'RESTAURANT_OWNER'
    }
  });




  const adminRestaurant = await prisma.restaurant.upsert({
    where: { name: 'TableTrek Testing Restaurant' },
    update: {},
    create: {
      name: 'TableTrek Testing Restaurant',
      address: '456 Admin Ave',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA',
      lat: 37.7749,
      lon: -122.4194,
      phone: '+1-555-0123',
      website: 'https://tabletrek.com',
      description: 'Premium dining experience with modern cuisine',
      cuisine: 'Modern American',
      priceRange: '$$$',
      ownerId: adminUser.id,
      openingTime: '17:00',
      closingTime: '23:00'
    }
  });



  await prisma.restaurantTable.createMany({
    data: [
      { restaurantId: adminRestaurant.id, label: 'Table 1', seats: 4 },
      { restaurantId: adminRestaurant.id, label: 'Table 2', seats: 2 },
      { restaurantId: adminRestaurant.id, label: 'Table 3', seats: 6 },
      { restaurantId: adminRestaurant.id, label: 'Table 4', seats: 8 },
      { restaurantId: adminRestaurant.id, label: 'Table 5', seats: 4 }
    ]
  });


  const sampleBookings = await prisma.booking.createMany({
    data: [
      {
        restaurantId: adminRestaurant.id,
        userId: user.id,
        startTime: new Date('2025-01-15T19:00:00Z'),
        endTime: new Date('2025-01-15T21:00:00Z'),
        partySize: 4,
        status: 'PENDING'
      },
      {
        restaurantId: adminRestaurant.id,
        userId: restaurantOwner.id,
        startTime: new Date('2025-01-16T18:30:00Z'),
        endTime: new Date('2025-01-16T20:30:00Z'),
        partySize: 2,
        status: 'CONFIRMED'
      },
      {
        restaurantId: adminRestaurant.id,
        userId: user.id,
        startTime: new Date('2025-01-17T20:00:00Z'),
        endTime: new Date('2025-01-17T22:00:00Z'),
        partySize: 6,
        status: 'PENDING'
      }
    ]
  });

  // Create menus for admin restaurant
  const menu = await prisma.menu.create({
    data: {
      name: 'Dinner Menu',
      description: 'Our signature dinner offerings',
      restaurantId: adminRestaurant.id
    }
  });

  // Create menu items
  await prisma.menuItem.createMany({
    data: [
      {
        name: 'Grilled Salmon',
        description: 'Fresh Atlantic salmon with herbs and lemon',
        price: 28.99,
        category: 'MAIN_COURSE',
        ingredients: 'Salmon, herbs, lemon, olive oil',
        allergens: 'Fish',
        available: true,
        menuId: menu.id
      },
      {
        name: 'Caesar Salad',
        description: 'Crisp romaine lettuce with parmesan and croutons',
        price: 14.99,
        category: 'APPETIZER',
        ingredients: 'Romaine lettuce, parmesan, croutons, caesar dressing',
        allergens: 'Dairy, Gluten',
        available: true,
        menuId: menu.id
      },
      {
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake with vanilla ice cream',
        price: 9.99,
        category: 'DESSERT',
        ingredients: 'Chocolate, flour, eggs, butter, vanilla ice cream',
        allergens: 'Dairy, Eggs, Gluten',
        available: true,
        menuId: menu.id
      }
    ]
  });


  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(19, 0, 0, 0);

  const endTime1 = new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000); // 2 hours after start
  const startTime2 = new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
  const endTime2 = new Date(startTime2.getTime() + 2 * 60 * 60 * 1000); // 2 hours after second start

  await prisma.booking.createMany({
    data: [
      {
        userId: user.id,
        restaurantId: adminRestaurant.id,
        partySize: 2,
        startTime: tomorrow,
        endTime: endTime1,
        status: 'CONFIRMED'
      },
      {
        userId: user.id,
        restaurantId: adminRestaurant.id,
        partySize: 4,
        startTime: startTime2,
        endTime: endTime2,
        status: 'PENDING'
      }
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
