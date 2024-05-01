import RedisClient from "ioredis"
import { REDIS_PASS, REDIS_ENDPOINT, REDIS_PORT } from '../../keys/upstash'

class Redis extends RedisClient {
    static instance: Redis
    constructor() {
        super(`rediss://default:${REDIS_PASS}@${REDIS_ENDPOINT}:${REDIS_PORT}`)
    }
    static getInstance() {
        if (!Redis.instance) {
            Redis.instance = new Redis()
        }
        return Redis.instance
    }
}

export default Redis.getInstance()
