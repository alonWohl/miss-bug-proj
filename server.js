import express from 'express'
import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
const app = express()
app.get('/', (req, res) => res.send('Hello there'))
const port = 3030
app.listen(port, () => console.log(`Server listening on port http://127.0.0.1:${port}/`))

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
    tiitle: req.query.title,
    description: req.query.description,
    severity: +req.query.severity,
    createdAt: req.query.createdAt
  }

  bugService
    .save(bugToSave)
    .then((savedBug) => res.send(savedBug))
    .catch((err) => {
      loggerService.error('Cannot save bug', err)
      res.status(500).send('Cannot save bug', err)
    })
})

app.get('/api/bug/:bugId', (req, res) => {
  const { bugId } = req.params
  bugService
    .getById(bugId)
    .then((bug) => res.send(bug))
    .catch((err) => {
      loggerService.error('cannot get bug', err)
      req.status('500').send('cannot get bug')
    })
})
