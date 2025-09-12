const { createClient } = require('redis');

let client;

if (process.env.REDIS_URL) {
  client = createClient({ url: process.env.REDIS_URL });
  client.on('error', (err) => console.error('Redis Client Error', err));
  client.on('connect', () => console.log('Redis client connected'));
  client.on('disconnect', () => console.log('Redis client disconnected'));
} else {
  console.warn('Redis URL not provided, Redis features will be disabled');
  // Create a mock client for development
  client = {
    isOpen: false,
    connect: async () => console.log('Mock Redis connected'),
    set: async () => 'OK',
    get: async () => null,
    del: async () => 1,
    eval: async () => 1
  };
}

async function connectRedis() {
  try {
    if (process.env.REDIS_URL && !client.isOpen) {
      await client.connect();
    }
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    throw error;
  }
}

module.exports = { client, connectRedis };

