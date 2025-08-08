const { securityHeaders, loginRateLimit, userRateLimit } = require('../src/middleware/security');

describe('security middleware', () => {
  it('securityHeaders sets minimal headers', () => {
    const req = {}; const headers = {};
    const res = { setHeader: (k, v) => { headers[k] = v; } };
    const next = jest.fn();
    securityHeaders(req, res, next);
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['X-XSS-Protection']).toBe('1; mode=block');
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(next).toHaveBeenCalled();
  });

  it('loginRateLimit skipped in test env', async () => {
    const req = { ip: '1.2.3.4', body: { email: 'a@b.com' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    await loginRateLimit(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('userRateLimit skipped in test env', async () => {
    const req = { user: { userId: 'u1' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    await userRateLimit(1)(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

