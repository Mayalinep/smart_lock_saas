const { add, isBlacklisted } = require('../src/services/tokenBlacklist');

describe('tokenBlacklist', () => {
  it('adds token to blacklist with TTL (memory fallback) and checks presence', async () => {
    const token = 't' + Math.random();
    await add(token, 2);
    expect(await isBlacklisted(token)).toBe(true);
  });

  it('expires after TTL', async () => {
    const token = 't' + Math.random();
    await add(token, 1);
    // attendre 1.2s
    await new Promise(r => setTimeout(r, 1200));
    expect(await isBlacklisted(token)).toBe(false);
  });
});

