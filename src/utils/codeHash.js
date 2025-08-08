const crypto = require('crypto');

const SALT_LENGTH = 16; // bytes
const ITERATIONS = 120000;
const KEY_LENGTH = 32; // 256 bits
const DIGEST = 'sha256';

function hashAccessCode(code) {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const derivedKey = crypto.pbkdf2Sync(code, salt, ITERATIONS, KEY_LENGTH, DIGEST);
  // Format: pbkdf2$sha256$iterations$saltBase64$hashBase64
  return `pbkdf2$${DIGEST}$${ITERATIONS}$${salt.toString('base64')}$${derivedKey.toString('base64')}`;
}

function compareAccessCode(code, hashed) {
  try {
    const [scheme, digest, iterStr, saltB64, hashB64] = hashed.split('$');
    if (scheme !== 'pbkdf2' || digest !== DIGEST) return false;
    const iterations = parseInt(iterStr, 10);
    const salt = Buffer.from(saltB64, 'base64');
    const expected = Buffer.from(hashB64, 'base64');
    const derived = crypto.pbkdf2Sync(code, salt, iterations, expected.length, digest);
    return crypto.timingSafeEqual(expected, derived);
  } catch (_) {
    return false;
  }
}

module.exports = { hashAccessCode, compareAccessCode };

