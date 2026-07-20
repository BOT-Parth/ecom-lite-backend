const { prisma, pool } = require('../src/config/prisma');
const bcrypt = require('bcrypt');

async function main() {
  console.log('Starting database seeding...');

  const env = require('../src/config/env');
  const adminEmail = env.SUPER_ADMIN_EMAIL;
  const adminPassword = env.SUPER_ADMIN_PASSWORD;
  const adminUsername = env.SUPER_ADMIN_USERNAME;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      'Missing SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD in environment variables'
    );
  }

  // 1. Seed Platform Permissions
  console.log('Seeding Platform Permissions...');
  const platformPermissionsToSeed = [
    { name: 'CREATE_STORE', description: 'Create a new store' },
    { name: 'APPROVE_STORE', description: 'Approve a store request' },
  ];

  const platformPermissions = {};
  for (const perm of platformPermissionsToSeed) {
    const dbPerm = await prisma.platformPermission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: perm,
    });
    platformPermissions[perm.name] = dbPerm;
  }

  // 2. Seed Platform Roles
  console.log('Seeding Platform Roles...');
  const superAdminRole = await prisma.platformRole.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: { description: 'Platform Super Administrator' },
    create: {
      name: 'SUPER_ADMIN',
      description: 'Platform Super Administrator',
    },
  });

  // 3. Map Platform Permissions to Platform Roles
  console.log('Mapping Platform Permissions to Platform Roles...');
  for (const permName of Object.keys(platformPermissions)) {
    const perm = platformPermissions[permName];
    await prisma.platformRolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: perm.id,
      },
    });
  }

  // 4. Seed Store Permissions
  console.log('Seeding Store Permissions...');
  const storePermissionsToSeed = [
    { name: 'MANAGE_STORE', description: 'Manage settings and metadata of the store' },
    { name: 'MANAGE_PRODUCTS', description: 'Manage products in the store' },
    { name: 'MANAGE_CATEGORIES', description: 'Manage product categories' },
    { name: 'MANAGE_INVENTORY', description: 'Manage product inventory stock' },
    { name: 'MANAGE_ORDERS', description: 'Manage customer orders' },
  ];

  const storePermissions = {};
  for (const perm of storePermissionsToSeed) {
    const dbPerm = await prisma.storePermission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: perm,
    });
    storePermissions[perm.name] = dbPerm;
  }

  // 5. Seed Store Roles
  console.log('Seeding Store Roles...');
  const storeRolesToSeed = [
    { name: 'STORE_OWNER', description: 'Store Owner' },
    { name: 'STORE_MANAGER', description: 'Store Manager' },
    { name: 'STORE_STAFF', description: 'Store Staff Member' },
  ];

  const storeRoles = {};
  for (const role of storeRolesToSeed) {
    const dbRole = await prisma.storeRole.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
    storeRoles[role.name] = dbRole;
  }

  // 6. Map Store Permissions to Store Roles
  console.log('Mapping Store Permissions to Store Roles...');
  // Helper to map permission to role
  async function mapStorePermission(roleName, permissionName) {
    await prisma.storeRolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: storeRoles[roleName].id,
          permissionId: storePermissions[permissionName].id,
        },
      },
      update: {},
      create: {
        roleId: storeRoles[roleName].id,
        permissionId: storePermissions[permissionName].id,
      },
    });
  }

  // Map permissions to STORE_OWNER
  const ownerPermissions = ['MANAGE_STORE', 'MANAGE_PRODUCTS', 'MANAGE_CATEGORIES', 'MANAGE_INVENTORY', 'MANAGE_ORDERS'];
  for (const perm of ownerPermissions) {
    await mapStorePermission('STORE_OWNER', perm);
  }

  // Map permissions to STORE_MANAGER
  const managerPermissions = ['MANAGE_STORE', 'MANAGE_PRODUCTS', 'MANAGE_CATEGORIES', 'MANAGE_INVENTORY', 'MANAGE_ORDERS'];
  for (const perm of managerPermissions) {
    await mapStorePermission('STORE_MANAGER', perm);
  }

  // Map permissions to STORE_STAFF
  const staffPermissions = ['MANAGE_PRODUCTS', 'MANAGE_CATEGORIES', 'MANAGE_INVENTORY', 'MANAGE_ORDERS'];
  for (const perm of staffPermissions) {
    await mapStorePermission('STORE_STAFF', perm);
  }

  // 7. Seed Default SUPER_ADMIN User
  console.log('Seeding default SUPER_ADMIN user...');
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      username: adminUsername,
      isActive: true,
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      username: adminUsername,
      isActive: true,
    },
  });

  // Assign SUPER_ADMIN platform role to admin user
  await prisma.userPlatformRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: superAdminRole.id,
    },
  });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
