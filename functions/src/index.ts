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
  gold: number
  isDead: boolean
}
//interface Monster {}
//interface RPG {}
//interface Formulas {}

const getPlayer = (req: express.Request, res: express.Response) => {
  // check auth (req.params.auth?), or do it below after getting collection

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
        gold: data.gold,
        isDead: data.isDead
      }
      res.json(playerData)
    })
    .catch(err => res.status(500).json({ error: err.code }))
}
// can accept lvl, xp, gold, isDead
const updatePlayer = (req: express.Request, res: express.Response) => {
  const playerData = {  // can add error checking here
    lvl: req.body.lvl,
    xp: req.body.xp,
    gold: req.body.gold
  }
  //if (playerData && req.body.id === req.params.id) {  // confirm user
    db.collection('profiles').doc(`${req.params.id}`)
      .update({
        lvl: req.body.lvl,
        xp: req.body.xp,
        gold: req.body.gold
      })
      .then(() => {
        res.json(playerData)
      })
      .catch((err) => res.status(500).json({ error: err.code }))
  //}
  //res.status(400).json({ message: 'Inadequate data submitted' })
}

app.get('/profile/:id', getPlayer)
app.post('/profile/:id', updatePlayer)