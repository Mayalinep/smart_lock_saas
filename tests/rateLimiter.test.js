const { incrementAndGet } = require('../src/services/rateLimiter');

describe('rateLimiter (memory fallback)', () => {
  it('allows first N then blocks', async () => {
    const key = 'k' + Math.random();
    const windowSec = 1;
    const max = 2;
    const r1 = await incrementAndGet(key, windowSec, max);
    expect(r1.allowed).toBe(true);
    const r2 = await incrementAndGet(key, windowSec, max);
    expect(r2.allowed).toBe(true);
    const r3 = await incrementAndGet(key, windowSec, max);
    expect(r3.allowed).toBe(false);
  });

  it('resets after window', async () => {
    const key = 'k' + Math.random();
    await incrementAndGet(key, 1, 1);
    await new Promise(r => setTimeout(r, 1100));
    const r = await incrementAndGet(key, 1, 1);
    expect(r.allowed).toBe(true);
  });
});

