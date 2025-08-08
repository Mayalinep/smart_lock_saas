const { hashAccessCode, compareAccessCode } = require('../src/utils/codeHash');

test('hash + compare fonctionne', () => {
  const code = '123456';
  const h = hashAccessCode(code);
  expect(h).toMatch(/^pbkdf2\$/);
  expect(compareAccessCode(code, h)).toBe(true);
  expect(compareAccessCode('000000', h)).toBe(false);
});

