// scripts/warm_cache.js
const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/api';

async function metrics() {
  const res = await axios.get(`${BASE_URL}/metrics`);
  const text = res.data;
  const hits = parseInt((text.match(/app_cache_hits\s+(\d+)/) || [])[1] || '0', 10);
  const misses = parseInt((text.match(/app_cache_misses\s+(\d+)/) || [])[1] || '0', 10);
  const hitRate = parseFloat((text.match(/app_cache_hit_rate\s+([0-9.]+)/) || [])[1] || '0');
  return { hits, misses, hitRate };
}

async function main() {
  try {
    const before = await metrics();
    console.log('Metrics before:', before);

    // Auth: créer un user et récupérer le cookie
    const user = {
      email: `warm.${Date.now()}@example.com`,
      password: 'TestPassword123!',
      firstName: 'Warm',
      lastName: 'Cache'
    };
    const reg = await axios.post(`${BASE_URL}/auth/register`, user);
    const cookie = reg.headers['set-cookie']?.[0] || '';
    const headers = { Cookie: cookie };

    // Créer une propriété
    const propCreate = await axios.post(`${BASE_URL}/properties`, { title: 'Warm Prop', address: '1 Rue Cache', description: '' }, { headers });
    const anyPropId = propCreate.data?.data?.property?.id;

    if (anyPropId) {
      // 1) lock status (5 min TTL) → 2ème appel doit compter un hit
      await axios.get(`${BASE_URL}/lock/status/${anyPropId}`, { headers }); // miss (pas compté en miss)
      await axios.get(`${BASE_URL}/lock/status/${anyPropId}`, { headers }); // hit (compté)
    }

    // 2) access property list (10 min TTL) → miss + hit
    if (anyPropId) {
      await axios.get(`${BASE_URL}/access/property/${anyPropId}?limit=50`, { headers }); // miss (compté)
      await axios.get(`${BASE_URL}/access/property/${anyPropId}?limit=50`, { headers }); // hit (compté)
    }

    const after = await metrics();
    console.log('Metrics after:', after);
  } catch (e) {
    console.error('Warm cache error:', e.message);
    process.exit(1);
  }
}

main();

