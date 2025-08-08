const request = require('supertest');
const app = require('../index');

describe('AuthController', () => {
  const base = '/api/auth';

  it('register -> 201, cookie set', async () => {
    const email = `u${Date.now()}@ex.com`;
    const res = await request(app)
      .post(`${base}/register`)
      .send({ email, password: 'TestPassword123!', firstName: 'A', lastName: 'B' });
    expect(res.status).toBe(201);
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.body?.data?.user?.email).toBe(email);
  });

  it('login -> 200, cookie set; bad password -> 401', async () => {
    const email = `u${Date.now()}@ex.com`;
    await request(app).post(`${base}/register`).send({ email, password: 'TestPassword123!', firstName: 'A', lastName: 'B' });

    const ok = await request(app).post(`${base}/login`).send({ email, password: 'TestPassword123!' });
    expect(ok.status).toBe(200);
    expect(ok.headers['set-cookie']).toBeDefined();

    const bad = await request(app).post(`${base}/login`).send({ email, password: 'Wrong123!' });
    expect(bad.status).toBe(401);
  });

  it('me -> 200 with cookie; 401 without cookie', async () => {
    const email = `u${Date.now()}@ex.com`;
    const reg = await request(app).post(`${base}/register`).send({ email, password: 'TestPassword123!', firstName: 'A', lastName: 'B' });
    const cookie = reg.headers['set-cookie'][0];

    const me = await request(app).get(`${base}/me`).set('Cookie', cookie);
    expect(me.status).toBe(200);

    const no = await request(app).get(`${base}/me`);
    expect(no.status).toBe(401);
  });
});

