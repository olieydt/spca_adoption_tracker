import { FRONTEND_URL, sleep } from './constants'
import fetch, { METHODS } from './components/FetchWrapper'
import { parse } from 'node-html-parser'
import firebase from './components/Firebase'
import email from './components/Email'
import { Request, Response } from '@google-cloud/functions-framework'
import Joi from 'joi'

const BASIC_OSX_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
const SCRAPE_PAUSE_MS = 5000

enum SEX {
    Male = 'male',
    Female = 'female'
}

enum AnimalType {
    Dog = 'dog',
    Cat = 'cat'
}

const userSchema = Joi.object({
    name: Joi.string().required().min(3).max(100),
    email: Joi.string().email().required(),
    animalTypeSubscriptions: Joi.array<AnimalType>().max(2).unique().required()
})

export type User = {
    name: string
    email: string
    animalTypeSubscriptions: AnimalType[]
}

export type Animal = {
    type: AnimalType
    name: string
    url: string
    ageType: string
    sex: SEX
}

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
        const htmlText = await response.text()
        const root = parse(htmlText)
        const dogsHtmlList = root.querySelectorAll('.card--link')
        Array.prototype.push.apply(animals, dogsHtmlList.reduce((acc, dogHtmlElement) => {
            const nameHtml = dogHtmlElement.querySelector('.card--title')
            const descriptionHtml = dogHtmlElement.querySelector('.pet--infos')
            if (!nameHtml || !descriptionHtml) {
                return acc
            }
            const { childNodes: [nameNode] } = nameHtml
            const { childNodes: [descriptionNode] } = descriptionHtml
            if (!nameNode || !descriptionNode) {
                return acc
            }
            const [_, ageType, __, sex] = descriptionNode.text.trim().split(' ● ')// Chien ● Jeune ● Mâle ● M
            acc.push({
                type: animalType,
                name: nameNode.text.trim(),
                ageType,
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

const getUnsubscribeLink = (userId: string) => `${FRONTEND_URL}unsubscribe?id=${userId}`

const sendNotifications = async (animals: Animal[]) => {
    const subscribedUsers = await firebase.getSubscribedUsers()
    const results = await Promise.allSettled(subscribedUsers.map(({ docId, user }) => {
        return email.sendNotifyEmail(user.name, user.email, [], getUnsubscribeLink(docId))
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
    await firebase.subscribeUser(validationResult.value as User)
    res.send({})
}

export const handleUnsubscribe = async (req: Request, res: Response) => {
    const { id } = req.query
    if (typeof id !== 'string') {
        res.status(422).send()
        return
    }
    try {
        await firebase.unsubscribeUser(id)
    } catch (error) {
        console.error(error)
        res.status(404).send()
        return
    }
}

export const handleScrapeJob = async (res: Response) => {
    console.log('starting to sync animals')
    const animals = await getAllAnimals()
    const { newAnimalIndexes, removedAnimalsCount } = await firebase.syncAnimals(animals)
    console.log(`synced animals, ${newAnimalIndexes.length} new and ${removedAnimalsCount} removed`)
    // send emails to subscribed clients
    await sendNotifications(newAnimalIndexes.map(i => animals[i]))
    res.send({})
}