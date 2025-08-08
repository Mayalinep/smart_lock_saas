const request = require('supertest');
const app = require('../index');

test('GET /api/health -> 200', async () => {
  const res = await request(app).get('/api/health');
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
});

