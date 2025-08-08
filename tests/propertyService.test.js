const prisma = require('../src/config/database');
const cache = require('../src/services/cache');
const {
  createProperty,
  getUserProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  togglePropertyStatus,
} = require('../src/services/propertyService');

describe('propertyService', () => {
  beforeEach(() => {
    // reset mocks
    prisma.property = prisma.property || {};
    prisma.property.create = jest.fn();
    prisma.property.findMany = jest.fn();
    prisma.property.findFirst = jest.fn();
    prisma.property.update = jest.fn();
    prisma.property.delete = jest.fn();

    cache.getWithMiss = jest.fn();
    cache.set = jest.fn();
    cache.del = jest.fn();
  });

  it('createProperty -> valide les champs et crée, invalide le cache', async () => {
    const ownerId = 'owner1';
    const data = { name: 'Maison', address: '10 rue X', description: '' };
    const created = { id: 'prop1', ...data, ownerId };
    prisma.property.create.mockResolvedValue(created);

    const res = await createProperty(data, ownerId);
    expect(prisma.property.create).toHaveBeenCalled();
    expect(cache.del).toHaveBeenCalledWith(`user:${ownerId}:properties`);
    expect(res.id).toBe('prop1');
  });

  it('createProperty -> 400 si champs manquants', async () => {
    await expect(createProperty({ name: 'X' }, 'u1')).rejects.toMatchObject({ status: 400 });
  });

  it('getUserProperties -> renvoie depuis cache si présent', async () => {
    const userId = 'u1';
    const cached = [{ id: 'p1' }];
    cache.getWithMiss.mockResolvedValue(cached);
    const res = await getUserProperties(userId);
    expect(res).toBe(cached);
    expect(prisma.property.findMany).not.toHaveBeenCalled();
  });

  it('getUserProperties -> DB puis set cache si miss', async () => {
    const userId = 'u1';
    cache.getWithMiss.mockResolvedValue(null);
    prisma.property.findMany.mockResolvedValue([{ id: 'p2' }]);
    const res = await getUserProperties(userId);
    expect(prisma.property.findMany).toHaveBeenCalledWith({ where: { ownerId: userId } });
    expect(cache.set).toHaveBeenCalled();
    expect(res[0].id).toBe('p2');
  });

  it('getPropertyById -> filtre par ownerId', async () => {
    prisma.property.findFirst.mockResolvedValue({ id: 'p1', ownerId: 'u1' });
    const ok = await getPropertyById('p1', 'u1');
    expect(ok?.id).toBe('p1');
    prisma.property.findFirst.mockResolvedValue(null);
    const no = await getPropertyById('p1', 'u2');
    expect(no).toBeNull();
  });

  it('updateProperty -> null si non trouvé, sinon met à jour + invalide cache', async () => {
    // not found
    prisma.property.findFirst.mockResolvedValue(null);
    const nf = await updateProperty('pX', 'u1', { name: 'N' });
    expect(nf).toBeNull();

    // found
    prisma.property.findFirst.mockResolvedValue({ id: 'p1', ownerId: 'u1' });
    prisma.property.update.mockResolvedValue({ id: 'p1', name: 'N' });
    const up = await updateProperty('p1', 'u1', { name: 'N' });
    expect(prisma.property.update).toHaveBeenCalled();
    expect(cache.del).toHaveBeenCalledWith('user:u1:properties');
    expect(up.name).toBe('N');
  });

  it('deleteProperty -> supprime si trouvé, sinon null', async () => {
    // not found
    prisma.property.findFirst.mockResolvedValue(null);
    const nf = await deleteProperty('pX', 'u1');
    expect(nf).toBeNull();

    // found
    prisma.property.findFirst.mockResolvedValue({ id: 'p1', ownerId: 'u1' });
    prisma.property.delete.mockResolvedValue({});
    const ok = await deleteProperty('p1', 'u1');
    expect(ok).toBe(true);
    expect(cache.del).toHaveBeenCalledWith('user:u1:properties');
  });

  it('togglePropertyStatus -> met à jour isActive si trouvé', async () => {
    prisma.property.findFirst.mockResolvedValue({ id: 'p1', ownerId: 'u1' });
    prisma.property.update.mockResolvedValue({ id: 'p1', isActive: false });
    const res = await togglePropertyStatus('p1', 'u1', false);
    expect(res?.isActive).toBe(false);
  });
});

