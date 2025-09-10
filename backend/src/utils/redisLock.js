const { client } = require('../config/redis');
const { randomUUID } = require('crypto');

async function acquireLock(key, ttl = 10000, retryDelay = 100, maxRetries = 10) {
  const token = randomUUID();
  let attempts = 0;
  while (attempts < maxRetries) {
    const ok = await client.set(key, token, { NX: true, PX: ttl });
    if (ok) return token;
    await new Promise(r => setTimeout(r, retryDelay));
    attempts++;
  }
  return null;
}

async function releaseLock(key, token) {
  // Lua script: if redis.get(key) == token then del(key)
  const script = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;
  return client.eval(script, { keys: [key], arguments: [token] });
}

module.exports = { acquireLock, releaseLock };