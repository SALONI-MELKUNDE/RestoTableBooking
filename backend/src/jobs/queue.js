const { Queue } = require('bullmq');

let notificationQueue;

if (process.env.REDIS_URL) {
  const connection = { url: process.env.REDIS_URL };
  notificationQueue = new Queue('notifications', { connection });
} else {
  // Mock queue for development without Redis
  notificationQueue = {
    add: async (name, data, options) => {
      console.log(`[QUEUE MOCK] Would add job: ${name}`, data);
      return { id: 'mock-job-id' };
    }
  };
}

module.exports = { notificationQueue };
