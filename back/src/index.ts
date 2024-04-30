import { http, Request, Response } from '@google-cloud/functions-framework'
import { generateRandomStr, SERVER_URL_PATHS } from './constants'
import { AsyncLocalStorage } from 'node:async_hooks'
import * as app from './app'
import { FRONTEND_HOST, URL_PATHS } from '../../shared/constants'


const asyncLocalStorage = new AsyncLocalStorage()

export const log = (payload: any, error?: any) => {
    const traceId = asyncLocalStorage.getStore()
    console.log(`${traceId}: ${JSON.stringify(payload)}${error ? ' ' + JSON.stringify(error) : ''}`)
}

const handleCors = (req: Request, res: Response) => {
    res.set('Access-Control-Allow-Origin', FRONTEND_HOST)
    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'GET, POST')
        res.set('Access-Control-Allow-Headers', 'Content-Type, jwt, trace-id')
        res.set('Access-Control-Max-Age', '0')
        res.status(204).send('')
        return false
    }
    return true
}

const handleRequest = async (req: Request, res: Response) => {
    const [_, path] = req.path.split('/')
    switch (path) {
        case SERVER_URL_PATHS.Scrape:
            return app.handleScrapeJob(req, res)
        case URL_PATHS.Subscribe:
            return app.handleSubscribe(req, res)
        case URL_PATHS.Unsubscribe:
            return app.handleUnsubscribe(req, res)
        case 'health':
            return {}
        default:
            throw 404
    }
}


http('entry', async (req, res) => {
    const reqId = req.header('trace-id') || generateRandomStr().slice(10)
    asyncLocalStorage.run(reqId, async () => {
        try {
            debugger
            const shouldHandle = handleCors(req, res)
            if (!shouldHandle) {
                return
            }
            await handleRequest(req, res)
        } catch (error) {
            if (typeof error === 'number') {
                res.status(error).end()
                return
            }
            console.error(error)
            res.status(500).end()
        }
    })
})

/*
gcloud functions deploy spca-scraper \
--runtime=nodejs20 \
--region=us-central1 \
--source=./dist \
--entry-point=entry \
--trigger-http \
--allow-unauthenticated \
--service-account spca-adoption@spca-adoption-notify.iam.gserviceaccount.com \
--timeout=540 \
--memory=256MB \
--docker-registry=artifact-registry
*/