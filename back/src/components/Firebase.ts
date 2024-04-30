import firebaseAdmin from 'firebase-admin'
import { initializeApp, App } from 'firebase-admin/app'
import { DocumentData, DocumentReference, FieldPath, Query } from 'firebase-admin/firestore'
import { getAuth, Auth, UserRecord } from "firebase-admin/auth"
import { Firestore, getFirestore } from "firebase-admin/firestore"
import serviceAccount from '../../keys/spca-adoption-notify-firebase-adminsdk-n3mam-d4d9f2a1f8.json'
import { Animal, User } from 'app'
import { generateRandomStr } from '../constants'

//https://firebase.google.com/docs/auth/admin/errors

const FIREBASE_USER_ID_LENGTH = 20

enum Collections {
    Animals = 'ANIMALS',
    Users = 'USERS'
}

type AnimalDb = Animal & {
    available: boolean
}

export const DOC_ID = 'docId'

class Firebase {
    app: App
    private db: Firestore
    private static instance: Firebase
    constructor() {
        this.app = initializeApp({
            credential: firebaseAdmin.credential.cert({
                projectId: serviceAccount.project_id,
                clientEmail: serviceAccount.client_email,
                privateKey: serviceAccount.private_key
            })
        })
        this.db = getFirestore()
    }

    static getInstance() {
        if (!Firebase.instance) {
            Firebase.instance = new Firebase()
        }
        return Firebase.instance
    }

    subscribeUser = async (user: User) => {
        const { docs } = await this.db.collection(Collections.Users)
            .where('email', '==', user.email)
            .select()
            .limit(1)
            .get()
        let userId: string
        if (docs.length < 1) {
            userId = generateRandomStr().slice(FIREBASE_USER_ID_LENGTH)
            await this.db.collection(Collections.Users).doc(userId).set(user)
        } else {
            userId = docs[0].id
            await docs[0].ref.update(user)
        }
        return userId
    }

    unsubscribeUser = async (userId: string) => {
        const doc = await this.db.collection(Collections.Users).doc(userId).get()
        if (!doc.exists) {
            throw new Error(`user ${userId} not found`)
        }
        return doc.ref.delete()
    }

    getSubscribedUsers: () => Promise<{ docId: string, user: User }[]> = async () => {
        const { docs } = await this.db.collection(Collections.Users)
            .get()
        return docs.map(doc => ({ docId: doc.id, user: doc.data() as User }))
    }

    isAnimalDiff = (oldAnimal: Animal, newAnimal: Animal) => {
        for (const [key, value] of Object.entries(oldAnimal)) {
            if (!(key in newAnimal) || value !== newAnimal[key as keyof Animal]) {
                return true
            }
        }
        return false
    }

    getAvailableAnimals = async () => {
        const { docs } = await this.db.collection(Collections.Animals)
            .where('available', '==', true)
            .get()
        return docs.map(doc => ({
            ref: doc.ref,
            animal: doc.data() as Animal
        }))
    }

    syncAnimals = async (animals: Animal[]) => {
        const availableAnimalDocs = await this.getAvailableAnimals()
        const existingIndexes = new Set<number>()
        await Promise.all(availableAnimalDocs.map(async ({ ref, animal }) => {
            const index = animals.findIndex(({ url }) => url === animal.url)
            if (index === -1) {
                await ref.update({
                    'available': false
                })
            } else {
                if (this.isAnimalDiff(animal, animals[index])) {
                    await ref.update(animals[index])
                }
                existingIndexes.add(index)
            }
        }))
        const newAnimalIndexes = []
        const additions: Promise<DocumentReference<DocumentData, DocumentData>>[] = []
        for (let i = 0; i < animals.length; i++) {
            if (existingIndexes.has(i)) continue
            newAnimalIndexes.push(i)
            additions.push(this.db.collection(Collections.Animals).add({
                ...animals[i],
                available: true
            }))
        }
        await Promise.all(additions)
        return { newAnimalIndexes, removedAnimalsCount: availableAnimalDocs.length - existingIndexes.size }
    }
}

export default Firebase.getInstance()