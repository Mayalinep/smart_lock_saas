const cache = require('../src/services/cache');

describe('cache (memory fallback, metrics)', () => {
  it('records misses and hits, TTL expiration', async () => {
    const key = 'k' + Math.random();
    // miss
    const m1 = await cache.getWithMiss(key);
    expect(m1).toBeNull();
    const m = cache.getMetrics();
    expect(m.misses).toBeGreaterThanOrEqual(1);

    // set and hit
    await cache.set(key, { v: 1 }, 1);
    const v = await cache.getWithMiss(key);
    expect(v?.v).toBe(1);
    const m2 = cache.getMetrics();
    expect(m2.hits).toBeGreaterThanOrEqual(1);

    // expire
    await new Promise(r => setTimeout(r, 1100));
    const v2 = await cache.getWithMiss(key);
    expect(v2).toBeNull();
  });

  it('delByPattern deletes matching keys (memory fallback)', async () => {
    const k1 = 'user:1:properties';
    const k2 = 'user:2:properties';
    await cache.set(k1, 1, 60);
    await cache.set(k2, 1, 60);
    await cache.delByPattern('user:1:*');
    const a = await cache.get(k1);
    const b = await cache.get(k2);
    expect(a).toBeNull();
    expect(b).toBe(1);
  });
});

