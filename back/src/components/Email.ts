import Mailjet from 'node-mailjet'
import { MAILJET_API_KEY, MAILJET_SECRET_KEY } from '../../keys/mailjet'
import getSignupEmail from '../assets/signup_email/signup'
import getNotificationHtml from '../assets/notifications_email/notifications'
import getNotificationRowHtml from '../assets/notifications_email/notificationRow'
import { Animal, AnimalType } from '../app'

class Email {
    static instance: Email
    mailjet: Mailjet
    constructor() {
        this.mailjet = new Mailjet({
            apiKey: MAILJET_API_KEY,
            apiSecret: MAILJET_SECRET_KEY
        })
    }
    static getInstance(): Email {
        if (!Email.instance) {
            Email.instance = new Email()
        }
        return Email.instance
    }

    async sendSubscribeEmail(customerName: string, customerEmail: string, animalTypeSubscriptions: AnimalType[], unsubscribeLink: string) {
        return this.sendEmail(customerName, customerEmail, 'Subscribed to SPCA Montreal notifications', getSignupEmail(customerName, animalTypeSubscriptions, unsubscribeLink), `Welcome! You can unsubscribe here: ${unsubscribeLink}`)
    }

    async sendNotifyEmail(customerName: string, customerEmail: string, animals: Animal[], unsubscribeLink: string) {
        return this.sendEmail(customerName, customerEmail, 'New animals found!', getNotificationHtml(customerName, animals.map(getNotificationRowHtml), unsubscribeLink), `Only html emails are available`)
    }

    async sendEmail(customerName: string, customerEmail: string, subject: string, emailHtml: string, emailText: string) {
        const request = this.mailjet
            .post('send', { version: 'v3.1' })
            .request({
                Messages: [
                    {
                        From: {
                            Email: 'no-reply@nofusstranscription.com',
                            Name: "FindYourCompanion.ca"
                        },
                        To: [
                            {
                                Email: customerEmail,
                                Name: customerName
                            }
                        ],
                        Subject: subject,
                        TextPart: emailText,
                        HTMLPart: emailHtml
                    }
                ]
            })
        try {
            const result: any = await request
            if (result.response.status !== 200 || result.body['Messages'][0]['Status'] !== 'success') {
                throw new Error(`could not send email: ${result.response.status} and body ${JSON.stringify(result.body['Messages'][0])}`)
            }
            console.log(`Send message with: ${result.body['Messages'][0]['Status']}`)
        }
        catch (error) {
            throw error
        }
    }
}

export default Email.getInstance()