const request = require('supertest');
const app = require('../index');
const prisma = require('../src/config/database');
const { generateToken } = require('../src/utils/jwt');

describe('Webhooks routes (protected)', () => {
  it('refuse sans auth', async () => {
    const res = await request(app).get('/api/webhooks');
    expect(res.statusCode).toBe(401);
  });

  it('crée et liste un endpoint', async () => {
    const user = await prisma.user.create({ data: {
      email: `w${Date.now()}@t.com`,
      password: 'x', firstName: 'A', lastName: 'B'
    }});
    const token = generateToken({ userId: user.id });
    const agent = request(app);
    const cookie = `token=${token}`;

    const create = await agent
      .post('/api/webhooks')
      .set('Cookie', cookie)
      .send({ url: 'https://example.com/hook', secret: 'supersecretlong1234', events: 'access_revoked' });
    expect(create.statusCode).toBe(201);

    const list = await agent.get('/api/webhooks').set('Cookie', cookie);
    expect(list.statusCode).toBe(200);
    expect(Array.isArray(list.body.items)).toBe(true);
  });
});

