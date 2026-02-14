const { Queue, Worker } = require('bullmq');
const Redis = require('redis');

// Redis connection
const redisClient = Redis.createClient({
    url: process.env.REDIS_URL
});

redisClient.on('connect', () => {
    console.log('✅ Connected to Redis');
});

redisClient.on('error', (err) => {
    console.error('❌ Redis connection error:', err);
});

redisClient.connect();

// Job queues for different platforms
const linkedinQueue = new Queue('linkedin-automation', {
    connection: {
        host: process.env.REDIS_URL?.split('://')[1]?.split(':')[0] || 'localhost',
        port: parseInt(process.env.REDIS_URL?.split(':')[2] || '6379')
    }
});

const instagramQueue = new Queue('instagram-automation', {
    connection: {
        host: process.env.REDIS_URL?.split('://')[1]?.split(':')[0] || 'localhost',
        port: parseInt(process.env.REDIS_URL?.split(':')[2] || '6379')
    }
});

const facebookQueue = new Queue('facebook-automation', {
    connection: {
        host: process.env.REDIS_URL?.split('://')[1]?.split(':')[0] || 'localhost',
        port: parseInt(process.env.REDIS_URL?.split(':')[2] || '6379')
    }
});

/**
 * Add a job to the appropriate queue with delay and retry logic
 * @param {string} platform - linkedin, instagram, or facebook
 * @param {object} jobData - Job payload
 * @param {number} delay - Delay in milliseconds before executing
 */
async function addAutomationJob(platform, jobData, delay = 0) {
    const queueMap = {
        linkedin: linkedinQueue,
        instagram: instagramQueue,
        facebook: facebookQueue
    };

    const queue = queueMap[platform];
    if (!queue) {
        throw new Error(`Invalid platform: ${platform}`);
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
        throw new Error(`Invalid platform: ${platform}`);
    }

    const [waiting, active, completed, failed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount()
    ]);

    return { waiting, active, completed, failed };
}

module.exports = {
    redisClient,
    linkedinQueue,
    instagramQueue,
    facebookQueue,
    addAutomationJob,
    getQueueStats
};
