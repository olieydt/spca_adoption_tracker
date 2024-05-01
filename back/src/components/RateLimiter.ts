import redis from './Redis'

const MAX_REQUEST_PER_HOUR = 20
const WINDOW = 3600

export const LUA = `
local current_time = redis.call('TIME')
local trim_time = tonumber(current_time[1]) - ARGV[1]
redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, trim_time)
local request_count = redis.call('ZCARD', KEYS[1])

if request_count < tonumber(ARGV[2]) then
    redis.call('ZADD', KEYS[1], current_time[1], current_time[1] .. current_time[2])
    redis.call('EXPIRE', KEYS[1], ARGV[1])
    return 0
end
return 1`

class RateLimiter {
    static instance: RateLimiter

    static getInstance() {
        if (!RateLimiter.instance) {
            RateLimiter.instance = new RateLimiter()
        }
        return RateLimiter.instance
    }

    async isLimited(ip: string | undefined) {
        if (!ip) {
            return true
        }
        const result = await redis.eval(LUA, 1, `RT_${ip}`, WINDOW, MAX_REQUEST_PER_HOUR)
        return Boolean(result)
    }
}

export default RateLimiter.getInstance()