const fetch = require('node-fetch')
import AbortController from 'abort-controller'

const DEFAULT_TIMEOUT_MS = 60 * 1000

export enum METHODS {
    Get = 'GET',
    Post = 'POST'
}

type InnerDict = string | number | Dict | Array<InnerDict>

export type Dict = {
    [key: string]: InnerDict | Array<InnerDict>
}

function isDict(obj: InnerDict | Array<InnerDict>): obj is Dict {
    return !Array.isArray(obj) && typeof obj === 'object'
}

type LocalHeaders = Record<string, string>

export type Params = Record<string, InnerDict | Array<InnerDict> | undefined>

class FetchWrapper {
    private static _instance: FetchWrapper
    getInstance() {
        if (FetchWrapper._instance) {
            return FetchWrapper._instance
        }
        FetchWrapper._instance = new FetchWrapper()
        return FetchWrapper._instance
    }

    addParams(url: string, params: Params): string {
        const paramKeys = Object.keys(params).filter(
            key => typeof params[key] !== 'undefined'
        )
        return (
            url +
            (paramKeys.length === 0
                ? ''
                : (url.indexOf('?') === -1 ? '?' : '&') + this.encodeParams(params))
        )
    }

    // thanks dog https://gist.github.com/lastguest/1fd181a9c9db0550a847
    private objectToFormObject(element: InnerDict | Array<InnerDict>, key: string, outerList?: Array<string>): Array<string> {
        let list = outerList || []
        if (isDict(element)) {
            for (let idx in element)
                this.objectToFormObject(
                    element[idx],
                    key + '[' + idx + ']',
                    list
                )
        } else if (Array.isArray(element)) {
            for (let i = 0; i < element.length; i++) {
                if (typeof element[i] === 'number' || typeof element[i] === 'string') {
                    list.push(`${key}[]=${element[i]}`)
                } else {
                    this.objectToFormObject(
                        element[i],
                        key + '[' + i + ']',
                        list
                    )
                }
            }
        } else {
            list.push(key + '=' + encodeURIComponent(element))
        }
        return list
    }

    encodeParams(params: Params): string {
        return Object.keys(params)
            .reduce((acc, key) => {
                const el = params[key]
                if (typeof el === 'undefined') {
                    return acc
                }
                acc.push(...this.objectToFormObject(el, key))
                return acc
            }, [] as string[])
            .join('&')
    }

    async makeRequest(
        url: string,
        method: METHODS = METHODS.Post,
        params: Params = {},
        headers: LocalHeaders = {},
        body?: Dict,
        fetchConfig: Record<string, number> = {}
    ): Promise<{ status: number, data?: Dict, response: Response, responseHeaders: Headers }> {
        const paramsUrl = this.addParams(url, params)
        let fetchBody: string | undefined
        if (body && (headers['Content-Type'] === 'application/json' || headers['content-type'] === 'application/json')) {
            fetchBody = JSON.stringify(body)
        }
        const timeoutMs = fetchConfig.timeoutMs || DEFAULT_TIMEOUT_MS
        let controller: AbortController | null = new AbortController()
        const requestTimeout = setTimeout(() => {
            controller?.abort()
        }, timeoutMs)
        let response: Response | undefined
        try {
            response = await fetch(paramsUrl, {
                method,
                headers,
                body: fetchBody,
                signal: controller.signal
            })
        } catch (error) {
            controller = null
            clearTimeout(requestTimeout)
            throw error
        }
        // clear for sanity
        clearTimeout(requestTimeout)
        if (!response) {
            throw new Error('no response')
        }
        const { status, headers: responseHeaders } = response
        const contentType = responseHeaders.get('content-type')
        if (contentType && contentType.includes('json')) {
            // hal+json
            // check if body
            try {
                let jsonBody = (await response.json()) as Dict
                return { status, data: jsonBody, response, responseHeaders }
            } catch (error) {
                return { status, response, responseHeaders }
            }
        }
        return { status, response, responseHeaders }
    }
}

export default new FetchWrapper()