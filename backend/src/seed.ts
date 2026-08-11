import prisma from './config/database';
import bcryptjs from 'bcryptjs';
import { UserRole } from '@prisma/client';

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.challanItem.deleteMany();
  await prisma.challan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // Create only essential users for demo/testing (per rolesbased.md requirements)
  console.log('👥 Creating essential users...');
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@fundsroom.com',
      password: await bcryptjs.hash('admin123', 10),
      fullName: 'Admin User',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      username: 'sales',
      email: 'sales@fundsroom.com',
      password: await bcryptjs.hash('sales123', 10),
      fullName: 'Sales Manager',
      role: UserRole.SALES,
      isActive: true,
    },
  });

  const warehouseUser = await prisma.user.create({
    data: {
      username: 'warehouse',
      email: 'warehouse@fundsroom.com',
      password: await bcryptjs.hash('warehouse123', 10),
      fullName: 'Warehouse Manager',
      role: UserRole.WAREHOUSE,
      isActive: true,
    },
  });

  const accountsUser = await prisma.user.create({
    data: {
      username: 'accounts',
      email: 'accounts@fundsroom.com',
      password: await bcryptjs.hash('accounts123', 10),
      fullName: 'Accounts Officer',
      role: UserRole.ACCOUNTS,
      isActive: true,
    },
  });

  console.log('✅ Users created:');
  console.log(`   - Admin: admin / admin123`);
  console.log(`   - Sales: sales / sales123`);
  console.log(`   - Warehouse: warehouse / warehouse123`);
  console.log(`   - Accounts: accounts / accounts123`);

  console.log('\n✨ Database seeded successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('   Admin: admin / admin123');
  console.log('   Sales: sales / sales123');
  console.log('   Warehouse: warehouse / warehouse123');
  console.log('   Accounts: accounts / accounts123');
  console.log('\n🏗️  All business data (customers, products, challans) should be created through the portal.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
