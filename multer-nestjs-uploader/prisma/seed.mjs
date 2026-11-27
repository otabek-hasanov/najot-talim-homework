import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const phones = [
  { title: 'iPhone 15', price: 699 },
  { title: 'Samsung Galaxy S24', price: 749 },
  { title: 'Google Pixel 8', price: 549 },
  { title: 'Xiaomi 14', price: 599 },
  { title: 'Samsung Galaxy A55', price: 349 },
];

try {
  const password = await bcrypt.hash('DemoSeller2026!', 10);
  await prisma.$transaction(async (tx) => {
    let owner = await tx.users.upsert({
      where: { email: 'phones.demo@example.com' },
      update: {},
      create: {
        name: 'Demo Seller',
        email: 'phones.demo@example.com',
        password,
        role: 'SELLER',
      },
    });
    if (owner.password === '!') {
      owner = await tx.users.update({
        where: { id: owner.id },
        data: { password },
      });
    }
    for (const phone of phones) {
      const existing = await tx.product.findFirst({
        where: { ownerId: owner.id, title: phone.title },
      });
      if (!existing) {
        await tx.product.create({ data: { ...phone, ownerId: owner.id } });
      }
    }
    console.log(`Demo seller: ${owner.email}`);
    console.log(await tx.product.findMany({
      where: { ownerId: owner.id },
      select: { id: true, title: true, price: true, ownerId: true },
      orderBy: { id: 'asc' },
    }));
  });
} finally {
  await prisma.$disconnect();
}
