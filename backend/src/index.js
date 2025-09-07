require('dotenv').config();
const app = require('./app');
const pino = require('pino')();
const { connectRedis } = require('./config/redis');
const worker = require('./jobs/worker');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Connect to Redis (optional)
    if (process.env.REDIS_URL) {
      await connectRedis();
      pino.info('Connected to Redis');
    } else {
      pino.warn('Redis not configured, running without Redis features');
    }
    
    // Start the server
    app.listen(PORT, () => {
      pino.info(`Server started on port ${PORT}`);
    });
    
    // Worker is automatically started when imported
    pino.info('Notification worker started');
  } catch (error) {
    pino.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
