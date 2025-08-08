const { errorHandler, notFound } = require('../src/middleware/errorHandler');

describe('errorHandler middleware', () => {
  it('maps Prisma validation to 400', () => {
    const err = { name: 'PrismaClientValidationError', message: 'x' };
    const req = {}; const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    errorHandler(err, req, res, () => {});
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('maps P2002 to 409', () => {
    const err = { code: 'P2002', message: 'unique' };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    errorHandler(err, {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('maps JWT errors to 401', () => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    errorHandler({ name: 'JsonWebTokenError' }, {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(401);
    errorHandler({ name: 'TokenExpiredError' }, {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('notFound sets 404 error', () => {
    const next = jest.fn();
    notFound({ originalUrl: '/nope' }, {}, next);
    const err = next.mock.calls[0][0];
    expect(err.status).toBe(404);
  });
});

