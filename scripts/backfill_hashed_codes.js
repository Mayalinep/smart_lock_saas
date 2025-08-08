// scripts/backfill_hashed_codes.js
const prisma = require('../src/config/database');
const { hashAccessCode } = require('../src/utils/codeHash');

async function main() {
  const legacy = await prisma.access.findMany({ where: { hashedCode: null } });
  console.log(`Legacy sans hashedCode: ${legacy.length}`);
  let updated = 0;
  for (const a of legacy) {
    if (!a.code) continue;
    const hashed = hashAccessCode(a.code);
    await prisma.access.update({ where: { id: a.id }, data: { hashedCode: hashed } });
    updated++;
  }
  console.log(`Hashed mis à jour: ${updated}`);
}

main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)});

