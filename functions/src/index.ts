import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express'
const app = express()
import * as cors from 'cors'
const corsHandler = cors({
  origin: true
})
app.use(corsHandler)
// 1 line cors: // @ts-ignore //tslint:disable-next-line:no-empty
// corsHandler(req, res, async () => { })

admin.initializeApp()
const db = admin.firestore()

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

// MONSTERS
const getAllMonsters = (req: express.Request, res: express.Response) => {
  return db.collection('monsters')
    .get()
    .then((snapshot) => {
      const monsters: Array<Object> = []
      snapshot.forEach(doc => {
        monsters.push({
          id: doc.data().id,
          name: doc.data().name,
          baseDamage: doc.data().baseDamage,
          baseHealth: doc.data().baseHealth
        })
      })
      res.json(monsters)
    })
}
const getRandomMonster = (req: express.Request, res: express.Response) => {
  // takes in lvl (or not?)

  // figure out # of monsters, return random
  db.collection('monsters')
    .get()
    .then(snapshot => {
      const numMonsters = snapshot.size
      const randomIndex = Math.floor(Math.random() * numMonsters)
      return snapshot.docs[randomIndex].data()
    })
    .then(data => {
      res.json(data)
    })
    .catch(err => {
      console.error(err)
      res.status(400).json({ monsters: 'Could not get' })
    })
}
//const getSpecificMonster = (req: express.Request, res: express.Response) => {
//  do stuff
//}

app.get('/monsters', getAllMonsters)
app.get('/monster', getRandomMonster)
//app.get('/monster/:name', getSpecificMonster)

// FORMULAS
// note: probably better off as a cloud trigger rather than cloud function, to keep hidden from players
// for now, who cares, it's just a linear model ;)
const getAllFormulas = (req: express.Request, res: express.Response) => {
  db.collection('formulas')
    .get()
    .then(snapshot => {
      const results: Array<any> = []
      snapshot.forEach(doc => {
        results.push(doc.data())
      })
      res.json(results)
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({ message: 'Something went wrong' })
    })
}

app.get('/formulas', getAllFormulas)
