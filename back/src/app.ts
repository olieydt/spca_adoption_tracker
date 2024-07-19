import fetch, { METHODS } from './components/FetchWrapper'
import { parse } from 'node-html-parser'
import firebase from './components/Firebase'
import crypto from 'crypto'
import email from './components/Email'
import { Request, Response } from '@google-cloud/functions-framework'
import Joi from 'joi'
import { AUTH_TOKEN } from '../keys/scrape'
import { ANIMAL_TYPE_SUBSCRIPTIONS_MAX, NAME_MAX_LENGTH, NAME_MIN_LENGTH, sleep, FRONTEND_HOST, SERVER_HOST } from '../../shared/constants'
import { AgeType, Animal, AnimalType, SEX, User } from '../../shared/types'

const BASIC_OSX_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
const SCRAPE_PAUSE_MS = 5000

const AgeTypeRecord: Record<string, AgeType> = {
    'Âgé': AgeType.Old,
    'Jeune': AgeType.Young,
    'Adulte': AgeType.Adult,
    'Bébé': AgeType.Baby
}

const unsubscribeSchema = Joi.object({
    id: Joi.string().length(20).required()
})

const userSchema = Joi.object({
    name: Joi.string().required().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH),
    email: Joi.string().email().required(),
    animalTypeSubscriptions: Joi.array<AnimalType>().min(1).max(ANIMAL_TYPE_SUBSCRIPTIONS_MAX).unique().required()
})


const getSpcaPageUrl = (animalType: AnimalType, pageNumber: number) => {
    return `https://www.spca.com/adoption/${animalType === AnimalType.Dog ? 'chiens' : 'chats'}-en-adoption/page/${pageNumber}`
}

const getAnimalsForType = async (animalType: AnimalType) => {
    let pageCount = 1
    const animals: Animal[] = []
    while (true) {
        const url = getSpcaPageUrl(animalType, pageCount++)
        const { status, response } = await fetch.makeRequest(url, METHODS.Get, {}, {
            'User-Agent': BASIC_OSX_USER_AGENT
        })
        if (status === 404) {
            break
        }
        if (status !== 200) {
            throw new Error(`Could not sync site, got status ${status}`)
        }
        const htmlText = await response.text()
        const root = parse(htmlText)
        const dogsHtmlList = root.querySelectorAll('.card--link')
        Array.prototype.push.apply(animals, dogsHtmlList.reduce((acc, dogHtmlElement) => {
            const nameHtml = dogHtmlElement.querySelector('.card--title')
            const descriptionHtml = dogHtmlElement.querySelector('.pet--infos')
            const imageHtml = dogHtmlElement.querySelector('img')
            if (!nameHtml || !descriptionHtml || !imageHtml) {
                return acc
            }
            const { childNodes: [nameNode] } = nameHtml
            const { childNodes: [descriptionNode] } = descriptionHtml
            if (!nameNode || !descriptionNode) {
                return acc
            }
            const [_, ageType, ___, sex] = descriptionNode.text.trim().split(' ● ')// Chien ● Jeune ● Mâle ● M
            acc.push({
                type: animalType,
                name: nameNode.text.trim(),
                ageType: AgeTypeRecord[ageType],
                imageUrl: imageHtml.getAttribute('src') || '',
                url: dogHtmlElement.attrs.href,
                sex: sex === 'M' ? SEX.Male : SEX.Female
            })
            return acc
        }, [] as Animal[]))
        await sleep(SCRAPE_PAUSE_MS)
    }
    return animals
}

const getAllAnimals = async () => {
    const animals: Animal[] = []
    Array.prototype.push.apply(animals, await getAnimalsForType(AnimalType.Dog))
    Array.prototype.push.apply(animals, await getAnimalsForType(AnimalType.Cat))
    return animals
}

const getUnsubscribeLink = (userId: string) => `${SERVER_HOST}/unsubscribe?id=${userId}`

const sendNotifications = async (animals: Animal[]) => {
    const subscribedUsers = await firebase.getSubscribedUsers()
    const results = await Promise.allSettled(subscribedUsers.map(async ({ docId, user }) => {
        const filteredAnimals = animals.filter(({ type }) => user.animalTypeSubscriptions.includes(type))
        if (filteredAnimals.length < 1) {
            return
        }
        return email.sendNotifyEmail(user.name, user.email, filteredAnimals, getUnsubscribeLink(docId))
    }))
    results.forEach((result, i) => {
        const { status } = result
        if (status === 'rejected') {
            console.log(`Could not email to ${subscribedUsers[i].docId}, error ${result.reason}`)
        }
    })
}

export const handleSubscribe = async (req: Request, res: Response) => {
    const { body } = req
    const validationResult = userSchema.validate(body)
    if (validationResult.error) {
        res.status(422).send()
        return
    }
    const user = validationResult.value as User
    user.email = user.email.trim().toLowerCase()
    const userId = await firebase.subscribeUser(user)
    await email.sendSubscribeEmail(user.name, user.email, user.animalTypeSubscriptions, getUnsubscribeLink(userId))
    res.send({
        success: true
    })
}

export const handleUnsubscribe = async (req: Request, res: Response) => {
    const validationResult = unsubscribeSchema.validate(req.query)
    if (validationResult.error) {
        res.status(422).send()
        return
    }
    const { value: { id: userId } } = validationResult
    try {
        await firebase.unsubscribeUser(userId)
        res.send({})
    } catch (error) {
        console.error(error)
        res.status(404).send()
        return
    }
}

export const handleScrapeJob = async (req: Request, res: Response) => {
    const token = req.header('X-AUTH-TOKEN')
    if (!token || !crypto.timingSafeEqual(Buffer.from(token), Buffer.from(AUTH_TOKEN))) {
        throw 401
    }
    console.log('starting to sync animals')
    const animals = await getAllAnimals()
    const { newAnimalIndexes, removedAnimalsCount } = await firebase.syncAnimals(animals)
    console.log(`synced animals, ${newAnimalIndexes.length} new and ${removedAnimalsCount} removed`)
    // send emails to subscribed clients
    if (newAnimalIndexes.length > 0) {
        await sendNotifications(newAnimalIndexes.map(i => animals[i]))
        console.log('Sent notifications')
    }
    res.send({})
}