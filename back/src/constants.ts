import crypto from 'crypto'
export const ENDPOINTS = {
    PORTAL_HOST: 'https://localhost:8100/'
}

export const IS_PROD = () => {
    return process.env.IS_PROD === '1'
}

export enum URL_PATHS {
    Scrape = 'scrape',
    Subscribe = 'subscribe',
    Unsubscribe = 'unsubscribe'
}

export const sleep = (time: number) => {
    return new Promise(resolve => setTimeout(resolve, time))
}

export const FRONTEND_URL = 'https://spca-adoption-notify.web.app/'


export const generateRandomStr = (N = 20, length?: number) => {
    const str = crypto.randomBytes(N).toString('hex')
    if (length) {
        return str.substring(0, length)
    }
    return str
}