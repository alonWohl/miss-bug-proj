import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
import { pdfService } from './services/pdf.service.js'
import { userService } from './services/user.service.js'

import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(express.static(path.resolve(__dirname, 'public')))
app.use(cookieParser())
app.use(express.json())

const port = process.env.PORT || 3030
app.get('/', (req, res) => res.send('Hello there'))
app.listen(port, () => console.log(`Server listening on port http://127.0.0.1:${port}/`))

app.get('/api/bug', (req, res) => {
  const filterBy = {
    txt: req.query.txt || '',
    minSeverity: +req.query.minSeverity || 0,
    pageIdx: req.query.pageIdx,
    sortBy: {
      field: req.query.field || 'createdAt',
      dir: req.query.dir === 'desc' ? -1 : 1
    }
  }

  bugService
    .query(filterBy)
    .then(bugs => res.send(bugs))
    .catch(err => {
      loggerService.error('Cannot get bugs', err)
      res.status(400).send('Cannot get bugs')
    })
})

app.get('/api/bug/:bugId', manageVisitedBugs, (req, res) => {
  const { bugId } = req.params

  bugService
    .getById(bugId)
    .then(bug => res.send(bug))
    .catch(err => {
      loggerService.error('Cannot get bug', err)
      res.status(400).send('Cannot get bug')
    })
})

app.post('/api/bug', (req, res) => {
  const user = userService.validateToken(req.cookies.loginToken)
  if (!user) return res.status(401).send('Unauthenticated')

  const bugToSave = {
    _id: req.body._id,
    title: req.body.title,
    severity: +req.body.severity,
    owner: req.body.owner
  }

  bugService
    .save(bugToSave, user)
    .then(savedBug => res.send(savedBug))
    .catch(err => {
      loggerService.error('Cannot save bug', err)
      res.status(400).send('Cannot save bug')
    })
})

app.put('/api/bug/:bugId', (req, res) => {
  const user = userService.validateToken(req.cookies.loginToken)
  if (!user) return res.status(401).send('Unauthenticated')

  const bugToSave = {
    _id: req.params.bugId,
    title: req.body.title,
    severity: +req.body.severity,
    owner: req.body.owner
  }

  bugService
    .save(bugToSave)
    .then(savedBug => res.send(savedBug))
    .catch(err => {
      loggerService.error('Cannot update bug', err)
      res.status(400).send('Cannot update bug')
    })
})

app.delete('/api/bug/:bugId', (req, res) => {
  const user = userService.validateToken(req.cookies.loginToken)
  if (!user) return res.status(401).send('Unauthenticated')

  const { bugId } = req.params
  bugService
    .remove(bugId, user)
    .then(() => res.send(`${bugId} removed successfully!`))
    .catch(err => {
      loggerService.error('Cannot remove bug', err)
      res.status(400).send('Cannot remove bug')
    })
})

app.get('/pdf', (req, res) => {
  bugService.query().then(bugs => {
    bugs.sort((a, b) => b.createdAt - a.createdAt)
    const rows = bugs.map(({ title, description, severity }) => [title, description, severity])
    const headers = ['Title', 'Description', 'Severity']
    const fileName = 'bugs'

    pdfService
      .createPdf({ headers, rows, title: 'Bugs Report', fileName })
      .then(() => {
        res.setHeader('Content-Type', 'application/pdf')
        res.sendFile(path.resolve(__dirname, `pdfs/${fileName}.pdf`))
      })
      .catch(err => {
        console.error(err)
        loggerService.error('Cannot download PDF', err)
        res.status(500).send('Problem generating PDF. Try again soon.')
      })
  })
})

app.post('/api/auth/login', (req, res) => {
  const credentials = req.body

  userService.checkLogin(credentials).then(user => {
    if (user) {
      const loginToken = userService.getLoginToken(user)
      res.cookie('loginToken', loginToken)
      res.send(user)
    } else {
      res.status(404).send('Invalid credentials')
    }
  })
})

app.post('/api/auth/signup', (req, res) => {
  const credentials = req.body

  userService.save(credentials).then(user => {
    if (user) {
      const loginToken = userService.getLoginToken(user)
      res.cookie('loginToken', loginToken)
      res.send(user)
    } else {
      res.status(400).send('Cannot sign up')
    }
  })
})

app.post('/api/user', (req, res) => {
  const user = userService.validateToken(req.cookies.loginToken)
  if (!user || !user.isAdmin) return res.status(401).send('Unauthorized')

  userService.query().then(users => res.send(users))
})

app.get('/api/user/:userId', (req, res) => {
  const { userId } = req.params
  const user = userService.validateToken(req.cookies.loginToken)
  if (!user) return res.status(401).send('Unauthenticated')

  userService.getById(userId).then(user => res.send(user))
})

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('loginToken')
  res.send('Logged out!')
})

app.get('/**', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'))
})

function manageVisitedBugs(req, res, next) {
  let visitedBugs = req.cookies.visitedBugs ? JSON.parse(req.cookies.visitedBugs) : []
  const { bugId } = req.params

  if (!visitedBugs.includes(bugId)) {
    visitedBugs.push(bugId)
  }
  if (visitedBugs.length > 3) {
    loggerService.error(`User visited more than 3 bugs: ${visitedBugs}`)
    return res.status(429).send('Too many requests. Please wait a moment.')
  }

  res.cookie('visitedBugs', JSON.stringify(visitedBugs), { maxAge: 7000 })
  next()
  console.log('User visited the following bugs:', visitedBugs)
}
