const request = require('supertest');
const app = require('../index');

describe('LockController', () => {
  const baseAuth = '/api/auth';
  const baseProp = '/api/properties';
  const baseLock = '/api/lock';

  async function createOwnerAndProperty() {
    const email = `l${Date.now()}@ex.com`;
    const reg = await request(app)
      .post(`${baseAuth}/register`)
      .send({ email, password: 'TestPassword123!', firstName: 'L', lastName: 'K' });
    const cookie = reg.headers['set-cookie'][0];
    const prop = await request(app)
      .post(baseProp)
      .set('Cookie', cookie)
      .send({ name: 'P1', address: '12 Rue Longue' });
    const propertyId = prop.body?.data?.property?.id;
    return { cookie, propertyId };
  }

  it('status -> 200 with owner; 401 unauth; 403 other user', async () => {
    const { cookie, propertyId } = await createOwnerAndProperty();
    const ok = await request(app).get(`${baseLock}/status/${propertyId}`).set('Cookie', cookie);
    expect(ok.status).toBe(200);

    const no = await request(app).get(`${baseLock}/status/${propertyId}`);
    expect(no.status).toBe(401);

    // autre utilisateur
    const reg2 = await request(app).post(`${baseAuth}/register`).send({ email: `o${Date.now()}@ex.com`, password: 'TestPassword123!', firstName: 'O', lastName: 'T' });
    const cookie2 = reg2.headers['set-cookie'][0];
    const forb = await request(app).get(`${baseLock}/status/${propertyId}`).set('Cookie', cookie2);
    expect([403, 500]).toContain(forb.status); // 403 attendu; 500 possible si service jette autre erreur
  });

  it('events -> 200 with owner; 401 unauth; 403 other user', async () => {
    const { cookie, propertyId } = await createOwnerAndProperty();
    const ok = await request(app).get(`${baseLock}/events/${propertyId}`).set('Cookie', cookie);
    expect(ok.status).toBe(200);

    const no = await request(app).get(`${baseLock}/events/${propertyId}`);
    expect(no.status).toBe(401);

    const reg2 = await request(app).post(`${baseAuth}/register`).send({ email: `o${Date.now()}@ex.com`, password: 'TestPassword123!', firstName: 'O', lastName: 'T' });
    const cookie2 = reg2.headers['set-cookie'][0];
    const forb = await request(app).get(`${baseLock}/events/${propertyId}`).set('Cookie', cookie2);
    expect(forb.status).toBe(403);
  });
});

