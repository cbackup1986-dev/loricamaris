/**
 * Prisma Seed Script
 * 
 * Run with: npx prisma db seed
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Ensure Guest User (ID: 0001)
  const guest = await prisma.user.upsert({
    where: { id: '0001' },
    update: {},
    create: {
      id: '0001',
      username: 'guest',
      email: 'guest@system.local',
      password: 'no-login',
    },
  });
  console.log(`✅ Guest user ready: ${guest.username} (ID: ${guest.id})`);

  // Add other seed data here if needed (e.g., initial system settings)

  console.log('✨ Seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
