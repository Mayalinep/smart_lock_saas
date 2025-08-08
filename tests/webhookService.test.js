const { signPayload } = require('../src/services/webhookService');

describe('webhookService.signPayload', () => {
  it('génère une signature HMAC sha256=...', () => {
    const secret = 'test_secret_1234567890';
    const ts = 1700000000;
    const raw = JSON.stringify({ id: 'evt_1', type: 't' });
    const sig = signPayload(secret, ts, raw);
    expect(sig.startsWith('sha256=')).toBe(true);
    expect(sig.length).toBeGreaterThan(20);
  });
});

