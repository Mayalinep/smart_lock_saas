const { mockDeep } = require('jest-mock-extended');
jest.mock('../src/config/database', () => mockDeep());

const prisma = require('../src/config/database');
const AccessService = require('../src/services/accessService');

describe('AccessService.validateAccessCode', () => {
  beforeEach(() => jest.resetAllMocks());

  test('retourne invalid si aucun accès ne matche', async () => {
    prisma.access.findMany.mockResolvedValue([]);
    const res = await AccessService.validateAccessCode('123456', 'prop1');
    expect(res.valid).toBe(false);
    expect(res.reason).toBe('CODE_INVALID');
  });
});

