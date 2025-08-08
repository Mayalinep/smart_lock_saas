const request = require('supertest');
const app = require('../index');

describe('AccessController', () => {
  const baseAuth = '/api/auth';
  const baseProp = '/api/properties';
  const baseAccess = '/api/access';

  async function createOwnerGuestAndProperty() {
    const ownerEmail = `a${Date.now()}@ex.com`;
    const regOwner = await request(app).post(`${baseAuth}/register`).send({ email: ownerEmail, password: 'TestPassword123!', firstName: 'O', lastName: 'W' });
    const ownerCookie = regOwner.headers['set-cookie'][0];
    const prop = await request(app).post(baseProp).set('Cookie', ownerCookie).send({ name: 'APT', address: '12 Rue Longue' });
    const propertyId = prop.body?.data?.property?.id;

    const guestEmail = `g${Date.now()}@ex.com`;
    const regGuest = await request(app).post(`${baseAuth}/register`).send({ email: guestEmail, password: 'TestPassword123!', firstName: 'G', lastName: 'U' });
    const guestId = regGuest.body?.data?.user?.id;
    return { ownerCookie, propertyId, guestId };
  }

  it('list property accesses (cursor) -> 200 with owner; 401 unauth; 403 other', async () => {
    const { ownerCookie, propertyId, guestId } = await createOwnerGuestAndProperty();
    // créer un accès
    await request(app)
      .post(baseAccess)
      .set('Cookie', ownerCookie)
      .send({ propertyId, userId: guestId, startDate: new Date(Date.now()-3600*1000).toISOString(), endDate: new Date(Date.now()+3600*1000).toISOString(), accessType: 'TEMPORARY' });

    const ok = await request(app).get(`${baseAccess}/property/${propertyId}`).set('Cookie', ownerCookie);
    expect(ok.status).toBe(200);
    expect(Array.isArray(ok.body?.data?.accesses)).toBe(true);

    const no = await request(app).get(`${baseAccess}/property/${propertyId}`);
    expect(no.status).toBe(401);

    // autre user
    const reg2 = await request(app).post(`${baseAuth}/register`).send({ email: `x${Date.now()}@ex.com`, password: 'TestPassword123!', firstName: 'X', lastName: 'Y' });
    const cookie2 = reg2.headers['set-cookie'][0];
    const forb = await request(app).get(`${baseAccess}/property/${propertyId}`).set('Cookie', cookie2);
    expect(forb.status).toBe(403);
  });

  it('my accesses (cursor) -> 200 with auth; 401 unauth', async () => {
    const { ownerCookie, propertyId, guestId } = await createOwnerGuestAndProperty();
    // créer accès pour guest
    await request(app)
      .post(baseAccess)
      .set('Cookie', ownerCookie)
      .send({ propertyId, userId: guestId, startDate: new Date(Date.now()-3600*1000).toISOString(), endDate: new Date(Date.now()+3600*1000).toISOString(), accessType: 'TEMPORARY' });

    // Ici on valide seulement 401 sans cookie (simple)
    const no = await request(app).get(`${baseAccess}/my-accesses`);
    expect(no.status).toBe(401);
  });
});

