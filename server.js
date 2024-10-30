import express from 'express'
import cookieParser from 'cookie-parser'
import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'

const app = express()

app.use(express.static('public'))
app.use(cookieParser())

app.get('/api/bug', (req, res) => {
  bugService
    .query()
    .then((bugs) => res.send(bugs))
    .catch((err) => {
      loggerService.error('Cannot Get bugs', err)
      res.status(500).send('Cannot Get bugs')
    })
})

app.get('/api/bug/save', (req, res) => {
  const bugToSave = {
    _id: req.query._id,
    title: req.query.title,
    description: req.query.description,
    severity: +req.query.severity,
    createdAt: +req.query.createdAt
  }

  bugService
    .save(bugToSave)
    .then((savedBug) => res.send(savedBug))
    .catch((err) => {
      loggerService.error('Cannot save bug', err)
      res.status(500).send('Cannot save bug', err)
    })
})

function manageVisitedBugs(req, res, bugId) {
  let visitedBugs = req.cookies.visitedBugs ? JSON.parse(req.cookies.visitedBugs) : []

  if (!visitedBugs.includes(bugId)) {
    visitedBugs.push(bugId)

    if (visitedBugs.length > 3) {
      loggerService.error(`User visited more than 3 bugs: ${visitedBugs}`)
      return res.status(401).send('Wait for a bit')
    }

    res.cookie('visitedBugs', JSON.stringify(visitedBugs), { maxAge: 7 * 1000 })
  }

  console.log('User visited the following bugs:', visitedBugs)
}

app.get('/api/bug/:bugId', (req, res) => {
  const { bugId } = req.params

  if (manageVisitedBugs(req, res, bugId)) return

  bugService
    .getById(bugId)
    .then((bug) => res.send(bug))
    .catch((err) => {
      loggerService.error('cannot get bug', err)
      req.status('500').send('cannot get bug')
    })
})

app.get('/api/bug/:bugId/remove', (req, res) => {
  const { bugId } = req.params
  bugService
    .remove(bugId)
    .then(() => res.send(bugId + 'Removed Successfully!'))
    .catch((err) => {
      loggerService.error('cannot remove bug', err)
      req.status('500').send('cannot remove bug')
    })
})

const port = 3031
app.get('/', (req, res) => res.send('Hello there'))
app.listen(port, () => console.log(`Server listening on port http://127.0.0.1:${port}/`))
