let createClient;
try {
  ({ createClient } = require('redis'));
} catch (_) {}

const REDIS_URL = process.env.REDIS_URL;

let redisClient = null;
let isRedisReady = false;

async function init() {
  if (isRedisReady || !createClient || !REDIS_URL) return;
  try {
    redisClient = createClient({ url: REDIS_URL });
    redisClient.on('error', () => {});
    await redisClient.connect();
    isRedisReady = true;
  } catch (_) {
    isRedisReady = false;
    redisClient = null;
  }
}

// Fallback mémoire: Map<key, { value: any, expiresAt: number }>
const memoryStore = new Map();

function nowSec() { return Math.floor(Date.now() / 1000); }

async function get(key) {
  await init();
  if (isRedisReady && redisClient) {
    const data = await redisClient.get(key);
    if (data == null) return null;
    try { return JSON.parse(data); } catch { return null; }
  }
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt && entry.expiresAt <= nowSec()) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value;
}

async function set(key, value, ttlSeconds) {
  await init();
  const ttl = Math.max(1, Math.min(ttlSeconds || 0, 60 * 60 * 24 * 7)); // max 7 jours
  if (isRedisReady && redisClient) {
    const payload = JSON.stringify(value);
    await redisClient.set(key, payload, { EX: ttl });
    return;
  }
  memoryStore.set(key, { value, expiresAt: nowSec() + ttl });
}

async function del(key) {
  await init();
  if (isRedisReady && redisClient) {
    await redisClient.del(key);
    return;
  }
  memoryStore.delete(key);
}

module.exports = {
  get,
  set,
  del,
};

