const { mockDeep } = require('jest-mock-extended');
jest.mock('../src/config/database', () => mockDeep());
jest.mock('../src/queues/emailQueue', () => ({ enqueueAccessRevoked: jest.fn() }));

const prisma = require('../src/config/database');
const { enqueueAccessRevoked } = require('../src/queues/emailQueue');
const AccessService = require('../src/services/accessService');

describe('AccessService.deleteAccessById', () => {
  beforeEach(() => jest.resetAllMocks());

  test('enfile un email de notification après révocation', async () => {
    prisma.access.findUnique.mockResolvedValue({
      id: 'a1', code: '123456', propertyId: 'p1', userId: 'u2', revokedAt: null,
      property: { ownerId: 'owner1' }
    });
    prisma.access.update.mockResolvedValue({ id: 'a1', userId: 'u2', propertyId: 'p1', revokedAt: new Date() });
    prisma.user.findUnique.mockResolvedValueOnce({ id: 'owner1', email: 'owner@ex.com' }) // owner
      .mockResolvedValueOnce({ id: 'u2', email: 'guest@ex.com' }); // user
    prisma.property.findUnique.mockResolvedValue({ id: 'p1', name: 'Prop' });

    const res = await AccessService.deleteAccessById('a1', 'owner1');
    expect(res.success).toBe(true);
    expect(enqueueAccessRevoked).toHaveBeenCalledWith(expect.objectContaining({
      ownerEmail: 'owner@ex.com', userEmail: 'guest@ex.com', propertyName: 'Prop'
    }));
  });
});

