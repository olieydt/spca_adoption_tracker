export enum URL_PATHS {
    Subscribe = 'subscribe',
    Unsubscribe = 'unsubscribe'
}

export const FRONTEND_HOST = 'https://spca-adoption-notify.web.app'
//export const FRONTEND_HOST = 'http://localhost:5173'

export const SERVER_HOST = 'https://us-central1-spca-adoption-notify.cloudfunctions.net/spca-scraper'
//export const SERVER_HOST = 'http://localhost:8080'

export const sleep = (time: number) => {
    return new Promise(resolve => setTimeout(resolve, time))
}

export const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

export const NAME_MIN_LENGTH = 2
export const NAME_MAX_LENGTH = 150
export const ANIMAL_TYPE_SUBSCRIPTIONS_MAX = 2