import { SERVER_HOST, URL_PATHS, getRandomInt, sleep } from "../../shared/constants"

const JSON_HEADERS: { [key: string]: string } = { 'Content-Type': 'application/json' }

export enum METHODS {
    Get = 'GET',
    Post = 'POST'
}

interface RequestParams<T> {
    body?: T
    headers?: Record<string, string>
}

const statusesToRetry = [408, 425, 429, 502, 503, 504]

class Api {
    static instance: Api
    static getInstance() {
        if (Api.instance) {
            return Api.instance
        }
        Api.instance = new Api()
        return Api.instance
    }

    async makeRequest<T1>(method: METHODS, path: URL_PATHS, requestParams: RequestParams<T1>, retryCount: number = 3) {
        let { body, headers } = requestParams
        if (!headers) {
            headers = JSON_HEADERS
        }
        const requestInit: RequestInit = {
            method,
            headers
        }
        if (method === METHODS.Post) {
            requestInit.body = JSON.stringify(body)
        }
        const url = `${SERVER_HOST}${path}`
        let response: Response | undefined
        let count: number = 0
        while (count++ < retryCount) {
            response = await fetch(url, requestInit)
            if (statusesToRetry.includes(response.status)) {
                const retryCount = Math.min(((2 ^ count) + getRandomInt(100, 400)), 5)
                await sleep(retryCount)
                continue
            }
            if (!response.ok) {
                throw new Error(`${response.status}`)
            }
            break
        }
        if (typeof response === 'undefined') {
            throw new Error('no response')
        }
    }
}

export default Api.getInstance()