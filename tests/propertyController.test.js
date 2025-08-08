const request = require('supertest');
const app = require('../index');

describe('PropertyController', () => {
  const baseAuth = '/api/auth';
  const baseProp = '/api/properties';

  async function createUserAndLogin() {
    const email = `p${Date.now()}@ex.com`;
    const reg = await request(app)
      .post(`${baseAuth}/register`)
      .send({ email, password: 'TestPassword123!', firstName: 'P', lastName: 'O' });
    const cookie = reg.headers['set-cookie'][0];
    return { email, cookie };
  }

  it('create property -> 201 with auth; 401 without', async () => {
    const { cookie } = await createUserAndLogin();
    const ok = await request(app)
      .post(baseProp)
      .set('Cookie', cookie)
      .send({ name: 'Appartement Canal', address: '12 Rue des Fleurs' });
    expect(ok.status).toBe(201);

    const no = await request(app)
      .post(baseProp)
      .send({ name: 'Appartement Canal', address: '12 Rue des Fleurs' });
    expect(no.status).toBe(401);
  });

  it('get my properties -> 200 with auth; 401 without', async () => {
    const { cookie } = await createUserAndLogin();
    const ok = await request(app).get(baseProp).set('Cookie', cookie);
    expect(ok.status).toBe(200);
    const no = await request(app).get(baseProp);
    expect(no.status).toBe(401);
  });
});

