require('dotenv').config();
const { prisma } = require('../src/config/prisma');
const fs = require('fs');
const path = require('path');

async function exportBackup() {
  try {
    const backupData = {
      timestamp: new Date().toISOString(),
      inventory: await prisma.inventory.findMany(),
      product: await prisma.product.findMany(),
      category: await prisma.category.findMany(),
      userStoreMembership: await prisma.userStoreMembership.findMany(),
      storeRequest: await prisma.storeRequest.findMany(),
      store: await prisma.store.findMany(),
      userPlatformRole: await prisma.userPlatformRole.findMany(),
      user: await prisma.user.findMany()
    };

    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname);
    const backupFile = path.join(backupDir, `db_backup_${timestampStr}.json`);
    
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2), 'utf-8');
    console.log(`BACKUP_FILE_PATH:${backupFile}`);
  } catch (error) {
    console.error("Backup failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportBackup();
