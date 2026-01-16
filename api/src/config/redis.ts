import Redis from 'ioredis'

const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: 2, // Limit retries to prevent long waits
    enableOfflineQueue: false, // Don't queue commands when disconnected
    retryStrategy: (times) => {
        if (times > 3) {
            // Stop retrying after 3 attempts
            console.log('⚠️  Redis unavailable - anti-spam disabled')
            return null
        }
        const delay = Math.min(times * 50, 2000)
        return delay
    },
    lazyConnect: true, // Don't connect until first command
})

redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully')
})

redisClient.on('error', (error) => {
    console.error('❌ Redis connection error:', error.message)
    console.error('💡 Redis is optional for development. Anti-spam will be disabled.')
})

// Try to connect, but don't block if it fails
redisClient.connect().catch(() => {
    console.log('⚠️  Redis not available - running without anti-spam protection')
})

export default redisClient
