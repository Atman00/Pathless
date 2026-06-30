// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing records...');
  await prisma.userInteraction.deleteMany({});
  await prisma.transactionItem.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding relational entities (3NF)...');

  // 1. Seed Users
  const user1 = await prisma.user.create({
    data: {
      name: 'Rafli',
      email: 'rafli@pathless.local',
    },
  });

  // 2. Seed Categories
  const tops = await prisma.category.create({ data: { name: 'Tops' } });
  const outerwear = await prisma.category.create({ data: { name: 'Outerwear' } });
  const bottoms = await prisma.category.create({ data: { name: 'Bottoms' } });

  // 3. Seed Products
  const p1 = await prisma.product.create({ data: { name: 'VOID T-SHIRT', category_id: tops.id, price: 250000 } });
  const p2 = await prisma.product.create({ data: { name: 'CONCRETE HOODIE', category_id: outerwear.id, price: 550000 } });
  const p3 = await prisma.product.create({ data: { name: 'INDUSTRIAL CARGO', category_id: bottoms.id, price: 450000 } });
  const p4 = await prisma.product.create({ data: { name: 'STEEL BOMBER', category_id: outerwear.id, price: 650000 } });
  const p5 = await prisma.product.create({ data: { name: 'RAW DENIM', category_id: bottoms.id, price: 500000 } });
  const p6 = await prisma.product.create({ data: { name: 'NOISE OVERSIZED', category_id: tops.id, price: 280000 } });
  const p7 = await prisma.product.create({ data: { name: 'DISTORTION JACKET', category_id: outerwear.id, price: 750000 } });
  const p8 = await prisma.product.create({ data: { name: 'STATIC PANTS', category_id: bottoms.id, price: 400000 } });

  // 4. Seed User Interactions (Simulasi preferensi user untuk produk Outerwear mahal)
  await prisma.userInteraction.createMany({
    data: [
      { user_id: user1.id, product_id: p2.id, interaction_type: 'view' }, // View CONCRETE HOODIE (550k)
      { user_id: user1.id, product_id: p4.id, interaction_type: 'like' }, // Like STEEL BOMBER (650k)
    ],
  });

  console.log('Database seeding completely successful.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });