const { mockDeep } = require('jest-mock-extended');
jest.mock('../src/config/database', () => mockDeep());
jest.mock('../src/services/cache', () => ({ getWithMiss: jest.fn().mockResolvedValue(null), set: jest.fn() }));

const prisma = require('../src/config/database');
const AccessService = require('../src/services/accessService');
const { hashAccessCode } = require('../src/utils/codeHash');

describe('AccessService.validateAccessCode - fenêtres temporelles', () => {
  beforeEach(() => jest.resetAllMocks());

  test('NOT_STARTED si startDate > now', async () => {
    const code = '111111';
    const now = new Date();
    prisma.access.findMany.mockResolvedValue([
      {
        id: 'a1',
        propertyId: 'p1',
        userId: 'u1',
        isActive: true,
        revokedAt: null,
        startDate: new Date(now.getTime() + 60_000),
        endDate: new Date(now.getTime() + 3_600_000),
        hashedCode: hashAccessCode(code),
      }
    ]);
    const res = await AccessService.validateAccessCode(code, 'p1');
    expect(res.valid).toBe(false);
    expect(res.reason).toBe('NOT_STARTED');
  });

  test('EXPIRED si endDate <= now', async () => {
    const code = '222222';
    const now = new Date();
    prisma.access.findMany.mockResolvedValue([
      {
        id: 'a2',
        propertyId: 'p2',
        userId: 'u2',
        isActive: true,
        revokedAt: null,
        startDate: new Date(now.getTime() - 3_600_000),
        endDate: new Date(now.getTime() - 60_000),
        hashedCode: hashAccessCode(code),
      }
    ]);
    const res = await AccessService.validateAccessCode(code, 'p2');
    expect(res.valid).toBe(false);
    expect(res.reason).toBe('EXPIRED');
  });

  test('valid quand now ∈ [startDate, endDate[', async () => {
    const code = '333333';
    const now = new Date();
    prisma.access.findMany.mockResolvedValue([
      {
        id: 'a3',
        propertyId: 'p3',
        userId: 'u3',
        isActive: true,
        revokedAt: null,
        startDate: new Date(now.getTime() - 60_000),
        endDate: new Date(now.getTime() + 3_600_000),
        hashedCode: hashAccessCode(code),
      }
    ]);
    const res = await AccessService.validateAccessCode(code, 'p3');
    expect(res.valid).toBe(true);
    expect(res.accessId).toBe('a3');
    expect(res.propertyId).toBe('p3');
    expect(res.userId).toBe('u3');
  });
});

