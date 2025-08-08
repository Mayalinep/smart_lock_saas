// scripts/bench_indexes.js
const prisma = require('../src/config/database');

function hr() { return process.hrtime.bigint(); }
function ms(start, end) { return Number(end - start) / 1e6; }

async function ensureTestData() {
  // Crée ~100 users, 100 properties, 10k accesses, 50k lock_events si dataset insuffisant
  // 1) Users
  let users = await prisma.user.findMany({ take: 100 });
  if (users.length < 100) {
    const toCreate = [];
    for (let i = users.length; i < 100; i++) {
      toCreate.push({ email: `bench${i}@ex.com`, password: 'x', firstName: 'B', lastName: 'U' });
    }
    if (toCreate.length > 0) await prisma.user.createMany({ data: toCreate });
    users = await prisma.user.findMany({ take: 100 });
  }

  // 2) Properties
  let properties = await prisma.property.findMany({ take: 100 });
  if (properties.length < 100) {
    const owner = users[0];
    const toCreate = [];
    for (let i = properties.length; i < 100; i++) {
      toCreate.push({ name: `Prop ${i}`, address: `Adr ${i}`, description: '', ownerId: owner.id });
    }
    if (toCreate.length > 0) await prisma.property.createMany({ data: toCreate });
    properties = await prisma.property.findMany({ take: 100 });
  }

  // 3) Accesses
  const accessCount = await prisma.access.count();
  if (accessCount < 10000) {
    const ownerId = users[0].id;
    const now = new Date();
    const batchSize = 1000;
    for (let offset = accessCount; offset < 10000; offset += batchSize) {
      const chunk = [];
      const endIdx = Math.min(10000, offset + batchSize);
      for (let i = offset; i < endIdx; i++) {
        const u = users[i % users.length].id;
        const p = properties[i % properties.length].id;
        const start = new Date(now.getTime() - (i % 500) * 60000);
        const end = new Date(now.getTime() + ((i % 1440) + 60) * 60000);
        chunk.push({
          code: `code${i}`,
          hashedCode: `hash${i}`,
          startDate: start,
          endDate: end,
          isActive: i % 5 !== 0,
          accessType: 'TEMPORARY',
          description: '',
          userId: u,
          propertyId: p,
          ownerId,
        });
      }
      await prisma.access.createMany({ data: chunk });
    }
  }

  // 4) Lock events
  const eventCount = await prisma.lockEvent.count();
  if (eventCount < 50000) {
    const now = new Date();
    const batchSize = 5000;
    for (let offset = eventCount; offset < 50000; offset += batchSize) {
      const chunk = [];
      const endIdx = Math.min(50000, offset + batchSize);
      for (let i = offset; i < endIdx; i++) {
        const p = properties[i % properties.length].id;
        chunk.push({ propertyId: p, type: 'ACCESS_GRANTED', timestamp: new Date(now.getTime() - i * 1000), details: '' });
      }
      await prisma.lockEvent.createMany({ data: chunk });
    }
  }
}

async function explain(query) {
  const res = await prisma.$queryRawUnsafe(`EXPLAIN QUERY PLAN ${query}`);
  return res;
}

async function time(fn) {
  const s = hr();
  const r = await fn();
  const e = hr();
  return { r, ms: ms(s, e) };
}

async function main() {
  console.log('Preparing dataset...');
  await ensureTestData();
  console.log('Dataset ready');

  // 1) accesses by propertyId & isActive
  const anyProp = (await prisma.property.findFirst()).id;
  const q1 = `SELECT id FROM accesses WHERE propertyId='${anyProp}' AND isActive=1`;
  console.log('\nQ1 EXPLAIN:', await explain(q1));
  const t1 = await time(() => prisma.$queryRawUnsafe(q1));
  console.log('Q1 time(ms):', t1.ms.toFixed(2), 'rows:', t1.r.length);

  // 2) accesses by userId & isActive
  const anyUser = (await prisma.user.findFirst()).id;
  const q2 = `SELECT id FROM accesses WHERE userId='${anyUser}' AND isActive=1`;
  console.log('\nQ2 EXPLAIN:', await explain(q2));
  const t2 = await time(() => prisma.$queryRawUnsafe(q2));
  console.log('Q2 time(ms):', t2.ms.toFixed(2), 'rows:', t2.r.length);

  // 3) lock_events by propertyId ordered by timestamp desc
  const q3 = `SELECT id FROM lock_events WHERE propertyId='${anyProp}' ORDER BY timestamp DESC LIMIT 100`;
  console.log('\nQ3 EXPLAIN:', await explain(q3));
  const t3 = await time(() => prisma.$queryRawUnsafe(q3));
  console.log('Q3 time(ms):', t3.ms.toFixed(2), 'rows:', t3.r.length);
}

main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)});

