import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors'
import * as express from 'express'

admin.initializeApp()
const db = admin.firestore()

const app = express()
app.use(cors())

exports.api = functions.https.onRequest(app)

interface Player {
  id: string
  name: string
  lvl: number
  xp: number
  isDead: boolean
}
//interface Monster {}
//interface RPG {}
//interface Formulas {}

const getPlayer = (req: express.Request, res: express.Response) => {
  // check auth (req.params.auth?)

  // get player data from document in /profiles collection
  db.collection('profiles').doc(`${req.params.id}`)
    .get()
    .then((doc) => {
      if (!doc.exists)
        res.status(404).json({ profile: 'Not found' })
      const data = doc.data()!
      const playerData: Player = {
        id: doc.id,
        name: data.name,
        lvl: data.lvl,
        xp: data.xp,
        isDead: data.isDead
      }
      res.json(playerData)
    })
    .catch(err => res.status(500).json({ error: err.code }))
}

app.get('/profile/:id', getPlayer)