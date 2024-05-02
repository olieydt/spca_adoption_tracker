import crypto from 'crypto'

export const IS_PROD = () => {
    return process.env.IS_PROD === '1'
}

export enum SERVER_URL_PATHS {
    Scrape = 'scrape'
}

export const upperCaseFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)


export const generateRandomStr = (N = 20) => {
    return crypto.randomBytes(N).toString('hex')
}