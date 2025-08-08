const { authenticate, authorize, optionalAuth } = require('../src/middleware/auth');

jest.mock('../src/services/tokenBlacklist', () => ({ isBlacklisted: jest.fn().mockResolvedValue(false) }));
jest.mock('../src/utils/jwt', () => ({ verifyToken: jest.fn(() => ({ userId: 'u1' })) }));
const prisma = require('../src/config/database');

describe('auth middleware', () => {
  it('authenticate -> 401 si token manquant', async () => {
    const req = { cookies: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await authenticate(req, res, () => {});
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('authenticate -> ok si token valide', async () => {
    const req = { cookies: { token: 't' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    await authenticate(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.userId).toBe('u1');
  });

  it('authorize -> 401 sans req.user', async () => {
    const req = {}; const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    await authorize(['ADMIN'])(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('authorize -> 403 si rôle non autorisé', async () => {
    prisma.user.findUnique = jest.fn().mockResolvedValue({ role: 'USER' });
    const req = { user: { userId: 'u1' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    await authorize(['ADMIN'])(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('optionalAuth -> passe sans token, et remplit req.user avec token', async () => {
    const req1 = { cookies: {} }; const res = {}; const next1 = jest.fn();
    await optionalAuth(req1, res, next1);
    expect(next1).toHaveBeenCalled();
    expect(req1.user).toBeUndefined();

    const req2 = { cookies: { token: 't' } }; const next2 = jest.fn();
    await optionalAuth(req2, res, next2);
    expect(next2).toHaveBeenCalled();
    expect(req2.user?.userId).toBe('u1');
  });
});

