/**
 * Queue Manager - Graceful Redis/BullMQ wrapper
 * Falls back to no-op if Redis is unavailable
 */

let redisClient = null;
let linkedinQueue = null;
let instagramQueue = null;
let facebookQueue = null;
let isConnected = false;

async function initializeQueues() {
    if (!process.env.REDIS_URL) {
        console.warn('⚠️  REDIS_URL not configured — queue manager disabled (jobs will not be processed)');
        return;
    }

    try {
        const Redis = require('redis');
        const { Queue } = require('bullmq');

        redisClient = Redis.createClient({ url: process.env.REDIS_URL });

        redisClient.on('connect', () => {
            console.log('✅ Connected to Redis');
            isConnected = true;
        });

        redisClient.on('error', (err) => {
            console.error('❌ Redis connection error:', err.message);
            isConnected = false;
        });

        await redisClient.connect();

        const connectionConfig = {
            host: process.env.REDIS_URL?.split('://')[1]?.split(':')[0] || 'localhost',
            port: parseInt(process.env.REDIS_URL?.split(':')[2] || '6379')
        };

        linkedinQueue = new Queue('linkedin-automation', { connection: connectionConfig });
        instagramQueue = new Queue('instagram-automation', { connection: connectionConfig });
        facebookQueue = new Queue('facebook-automation', { connection: connectionConfig });

        console.log('✅ Job queues initialized (linkedin, instagram, facebook)');
    } catch (err) {
        console.warn('⚠️  Failed to initialize Redis/BullMQ:', err.message);
        console.warn('⚠️  Queue manager running in no-op mode');
    }
}

/**
 * Add a job to the appropriate queue with delay and retry logic
 */
async function addAutomationJob(platform, jobData, delay = 0) {
    const queueMap = {
        linkedin: linkedinQueue,
        instagram: instagramQueue,
        facebook: facebookQueue
    };

    const queue = queueMap[platform];
    if (!queue) {
        console.warn(`⚠️  Queue not available for platform: ${platform} (Redis not connected)`);
        return null;
    }

    return await queue.add(`${platform}-action`, jobData, {
        delay,
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000
        },
        removeOnComplete: 100,
        removeOnFail: 50
    });
}

/**
 * Get queue statistics
 */
async function getQueueStats(platform) {
    const queueMap = {
        linkedin: linkedinQueue,
        instagram: instagramQueue,
        facebook: facebookQueue
    };

    const queue = queueMap[platform];
    if (!queue) {
        return { waiting: 0, active: 0, completed: 0, failed: 0 };
    }

    const [waiting, active, completed, failed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount()
    ]);

    return { waiting, active, completed, failed };
}

// Initialize on first import (non-blocking)
initializeQueues().catch(err => {
    console.warn('⚠️  Queue initialization failed:', err.message);
});

module.exports = {
    redisClient,
    linkedinQueue,
    instagramQueue,
    facebookQueue,
    addAutomationJob,
    getQueueStats,
    isConnected: () => isConnected
};
