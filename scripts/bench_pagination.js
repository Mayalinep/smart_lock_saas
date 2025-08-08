/* scripts/bench_pagination.js
 * Seed volumétrique ciblé et bench des endpoints paginés.
 * - Crée un utilisateur propriétaire via API (si serveur up) pour obtenir un cookie d'auth
 * - Crée 1 propriété via API
 * - Seed en masse via Prisma: ~12k accesses sur la propriété, ~60k lock_events
 * - Mesure p50/p95/p99 sur:
 *   - GET /api/access/property/:propertyId?limit=50&cursor=...
 *   - GET /api/lock/events/:propertyId?limit=50&cursor=...
 * - Récupère métriques cache avant/après
 */

const axios = require('axios');
const prisma = require('../src/config/database');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/api';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function percentile(values, p) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * sorted.length)));
  return sorted[idx];
}

async function fetchMetrics() {
  try {
    const res = await axios.get(`${BASE_URL}/metrics`);
    const text = res.data;
    const hitMatch = text.match(/app_cache_hits\s+(\d+)/);
    const missMatch = text.match(/app_cache_misses\s+(\d+)/);
    const rateMatch = text.match(/app_cache_hit_rate\s+([0-9.]+)/);
    return {
      hits: hitMatch ? parseInt(hitMatch[1], 10) : 0,
      misses: missMatch ? parseInt(missMatch[1], 10) : 0,
      hitRate: rateMatch ? parseFloat(rateMatch[1]) : 0,
    };
  } catch {
    return null;
  }
}

async function ensureDataset(ownerId, propertyId) {
  // Créer quelques guests si insuffisants
  let guestUsers = await prisma.user.findMany({ take: 50 });
  if (guestUsers.length < 50) {
    const toCreate = [];
    for (let i = guestUsers.length; i < 50; i++) {
      toCreate.push({ email: `bench.guest.${Date.now()}_${i}@ex.com`, password: 'x', firstName: 'G', lastName: 'U' });
    }
    if (toCreate.length > 0) await prisma.user.createMany({ data: toCreate });
    guestUsers = await prisma.user.findMany({ take: 50 });
  }

  // Accesses pour cette propriété
  const accessCount = await prisma.access.count({ where: { propertyId } });
  if (accessCount < 12000) {
    const now = new Date();
    const batchSize = 1000;
    for (let offset = accessCount; offset < 12000; offset += batchSize) {
      const chunk = [];
      const endIdx = Math.min(12000, offset + batchSize);
      for (let i = offset; i < endIdx; i++) {
        const u = guestUsers[i % guestUsers.length].id;
        const start = new Date(now.getTime() - (i % 720) * 60000);
        const end = new Date(now.getTime() + ((i % 2880) + 60) * 60000);
        chunk.push({
          code: `code_pg_${i}`,
          hashedCode: `hash_pg_${i}`,
          startDate: start,
          endDate: end,
          isActive: i % 7 !== 0,
          accessType: 'TEMPORARY',
          description: '',
          userId: u,
          propertyId,
          ownerId,
        });
      }
      await prisma.access.createMany({ data: chunk });
      process.stdout.write(`accesses: ${endIdx}/12000\r`);
    }
    process.stdout.write('\n');
  }

  // Lock events pour cette propriété
  const eventCount = await prisma.lockEvent.count({ where: { propertyId } });
  if (eventCount < 60000) {
    const now = new Date();
    const batchSize = 5000;
    for (let offset = eventCount; offset < 60000; offset += batchSize) {
      const chunk = [];
      const endIdx = Math.min(60000, offset + batchSize);
      for (let i = offset; i < endIdx; i++) {
        chunk.push({ propertyId, type: 'LOCK_STATUS_CHECK', timestamp: new Date(now.getTime() - i * 1000), details: '' });
      }
      await prisma.lockEvent.createMany({ data: chunk });
      process.stdout.write(`lock_events: ${endIdx}/60000\r`);
    }
    process.stdout.write('\n');
  }
}

async function benchEndpointSequence(cookie, url, pageLimit = 10, limit = 50) {
  const times = [];
  let cursor = undefined;
  for (let page = 0; page < pageLimit; page++) {
    const qs = new URLSearchParams();
    qs.set('limit', String(limit));
    if (cursor) qs.set('cursor', cursor);
    const fullUrl = `${BASE_URL}${url}?${qs.toString()}`;
    const t0 = Date.now();
    const res = await axios.get(fullUrl, { headers: { Cookie: cookie } });
    const dt = Date.now() - t0;
    times.push(dt);
    const data = res.data?.data;
    cursor = data?.nextCursor || null;
    if (!data?.hasMore || !cursor) break;
    // petite pause pour laisser le cache s'amorcer
    await sleep(50);
  }
  return {
    count: times.length,
    p50: percentile(times, 50).toFixed(1),
    p95: percentile(times, 95).toFixed(1),
    p99: percentile(times, 99).toFixed(1),
    samples: times,
  };
}

async function main() {
  // 1) Vérifier serveur / health
  let serverUp = false;
  try {
    const health = await axios.get(`${BASE_URL}/health`);
    serverUp = health.status === 200;
  } catch {}

  if (!serverUp) {
    console.log('⚠️ Serveur indisponible. Seed volumétrique uniquement (pas de bench API).');
  }

  // 2) Préparer utilisateur propriétaire et propriété
  let cookie = '';
  let ownerId = '';
  let propertyId = '';

  if (serverUp) {
    const user = {
      email: `bench.owner.${Date.now()}@example.com`,
      password: 'TestPassword123!',
      firstName: 'Bench',
      lastName: 'Owner'
    };
    const reg = await axios.post(`${BASE_URL}/auth/register`, user);
    cookie = reg.headers['set-cookie']?.[0] || '';
    ownerId = reg.data?.data?.user?.id;
    const prop = await axios.post(`${BASE_URL}/properties`, { title: 'Bench Property', address: '1 Rue Bench', description: '' }, { headers: { Cookie: cookie } });
    propertyId = prop.data?.data?.property?.id;
  } else {
    // Pas de serveur → créer via Prisma
    const owner = await prisma.user.create({ data: { email: `bench.owner.${Date.now()}@example.com`, password: 'x', firstName: 'Bench', lastName: 'Owner' } });
    ownerId = owner.id;
    const property = await prisma.property.create({ data: { name: 'Bench Property', address: '1 Rue Bench', description: '', ownerId } });
    propertyId = property.id;
  }

  // 3) Seed volumétrique ciblé
  console.log('🧪 Seed volumétrique (accesses ~12k, lock_events ~60k)...');
  await ensureDataset(ownerId, propertyId);
  console.log('✅ Dataset prêt pour propertyId =', propertyId);

  if (!serverUp) {
    console.log('ℹ️ Lancez le serveur puis relancez ce script pour le bench API.');
    process.exit(0);
  }

  // 4) Metrics avant
  const before = await fetchMetrics();
  if (before) console.log('📊 Cache avant:', before);

  // 5) Bench endpoints paginés
  console.log('⏱️ Bench /api/access/property/:propertyId ...');
  const b1 = await benchEndpointSequence(cookie, `/access/property/${propertyId}`, 10, 50);
  console.log('   pages:', b1.count, 'p50:', b1.p50, 'ms  p95:', b1.p95, 'ms  p99:', b1.p99, 'ms');

  console.log('⏱️ Bench /api/lock/events/:propertyId ...');
  const b2 = await benchEndpointSequence(cookie, `/lock/events/${propertyId}`, 10, 50);
  console.log('   pages:', b2.count, 'p50:', b2.p50, 'ms  p95:', b2.p95, 'ms  p99:', b2.p99, 'ms');

  // 6) Metrics après
  const after = await fetchMetrics();
  if (after) console.log('📊 Cache après:', after);

  console.log('🎯 Bench terminé');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });

