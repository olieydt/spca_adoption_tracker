import firebaseAdmin from 'firebase-admin'
import { initializeApp, App } from 'firebase-admin/app'
import { DocumentData, FieldPath, Query } from 'firebase-admin/firestore'
import { getAuth, Auth, UserRecord } from "firebase-admin/auth"
import { Firestore, getFirestore } from "firebase-admin/firestore"
import serviceAccount from '../../keys/spca-adoption-notify-firebase-adminsdk-n3mam-d4d9f2a1f8.json'
import { Animal, User } from 'app'
import { generateRandomStr } from '../constants'

//https://firebase.google.com/docs/auth/admin/errors

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
            .limit(1)
            .get()
        let userId: string
        if (docs.length < 1) {
            userId = generateRandomStr()
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

    syncAnimals = async (animals: Animal[]) => {
        const { docs } = await this.db.collection(Collections.Animals)
            .where('available', '==', true)
            .select('url')
            .get()
        const deletedIndexes = new Set<number>()
        for (const doc of docs) {
            const index = animals.findIndex(({ url }) => url === doc.data().url)
            if (index === -1) {
                doc.ref.update({
                    'available': false
                })
            } else {
                deletedIndexes.add(index)
            }
        }
        const newAnimalIndexes = []
        for (let i = 0; i < animals.length; i++) {
            if (deletedIndexes.has(i)) continue
            newAnimalIndexes.push(i)
            this.db.collection(Collections.Animals).add({
                ...animals[i],
                available: true
            })
        }
        return { newAnimalIndexes, removedAnimalsCount: deletedIndexes.size }
    }
}

export default Firebase.getInstance()