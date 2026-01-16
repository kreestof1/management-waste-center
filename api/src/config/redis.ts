import Redis from 'ioredis'

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
})

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully')
})

redisClient.on('error', (error) => {
  console.error('❌ Redis connection error:', error.message)
  console.error('💡 Redis is optional for development. Anti-spam will be disabled.')
})

export default redisClient
