import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors'
import * as express from 'express'

admin.initializeApp()
const db = admin.firestore()

const app = express()
app.use(cors())

exports.api = functions.https.onRequest(app)

//interface Player {}
//interface Monster {}
//interface RPG {}

