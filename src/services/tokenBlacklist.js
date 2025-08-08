const crypto = require('crypto');
let createClient;
try {
  ({ createClient } = require('redis'));
} catch (_) {
  // redis non installé: on utilisera le fallback mémoire
}

const REDIS_URL = process.env.REDIS_URL;

let redisClient = null;
let isRedisReady = false;

// Fallback mémoire avec TTL
const memoryStore = new Map(); // key -> expiresAtEpochSeconds

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function buildKey(token) {
  return `blacklist:jwt:${sha256(token)}`;
}

async function init() {
  if (isRedisReady || !createClient || !REDIS_URL) return;
  try {
    redisClient = createClient({ url: REDIS_URL });
    redisClient.on('error', () => {});
    await redisClient.connect();
    isRedisReady = true;
  } catch (_err) {
    isRedisReady = false;
    redisClient = null;
  }
}

function nowEpochSeconds() {
  return Math.floor(Date.now() / 1000);
}

async function add(token, ttlSeconds) {
  await init();
  const safeTtl = Math.max(1, Math.min(ttlSeconds || 0, 60 * 60 * 24 * 30)); // max 30j
  const key = buildKey(token);

  if (isRedisReady && redisClient) {
    // Stockage côté Redis avec TTL
    await redisClient.set(key, '1', { EX: safeTtl });
  } else {
    // Fallback mémoire
    memoryStore.set(key, nowEpochSeconds() + safeTtl);
  }
}

async function isBlacklisted(token) {
  await init();
  const key = buildKey(token);
  if (isRedisReady && redisClient) {
    const exists = await redisClient.exists(key);
    return exists === 1;
  }
  const expiresAt = memoryStore.get(key);
  if (!expiresAt) return false;
  if (expiresAt <= nowEpochSeconds()) {
    memoryStore.delete(key);
    return false;
  }
  return true;
}

module.exports = {
  init,
  add,
  isBlacklisted,
};

