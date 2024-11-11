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

  if (req.query.sortBy) req.query.sortBy = JSON.parse(req.query.sortBy)

  bugService
    .query(filterBy)
    .then(bugs => res.send(bugs))
    .catch(err => {
      loggerService.error('Cannot Get bugs', err)
      res.status(400).send('Cannot Get bugs')
    })
})

app.get('/api/bug/:bugId', manageVisitedBugs, (req, res) => {
  const { bugId } = req.params

  bugService
    .getById(bugId)
    .then(bug => res.send(bug))
    .catch(err => {
      loggerService.error('cannot get bug', err)
      res.status(400).send('cannot get bug')
    })
})

app.post('/api/bug', (req, res) => {
  const user = userService.validateToken(req.cookies.loginToken)
  if (!user) return res.status(401).send('Unauthenticated')
  const bugToSave = {
    _id: req.params.id,
    title: req.body.title,
    severity: +req.body.severity,
    owner: req.body.owner
  }

  bugService
    .save(bugToSave, user)
    .then(savedBug => res.send(savedBug))
    .catch(err => {
      loggerService.error('Cannot save bug', err)
      res.status(400).send('Cannot save bug', err)
    })
})

app.put('/api/bug/:bugId', (req, res) => {
  const user = userService.validateToken(req.cookies.loginToken)
  if (!user) return res.status(401).send('Unauthenticated')

  const bugToSave = {
    _id: req.params.id,
    title: req.body.title,
    severity: +req.body.severity,
    owner: req.body.owner
  }

  bugService
    .save(bugToSave)
    .then(savedBug => res.send(savedBug))
    .catch(err => {
      loggerService.error('Cannot save bug', err)
      res.status(400).send('Cannot save bug', err)
    })
})

app.delete('/api/bug/:bugId/', (req, res) => {
  const user = userService.validateToken(req.cookies.loginToken)
  if (!user) return res.status(401).send('Unauthenticated')

  const { bugId } = req.params
  bugService
    .remove(bugId, user)
    .then(() => res.send(bugId + 'Removed Successfully!'))
    .catch(err => {
      loggerService.error('cannot remove bug', err)
      res.status(400).send('cannot remove bug')
    })
})

app.get('/pdf', (req, res) => {
  const path = './pdfs/'
  console.log('in pdf')

  bugService.query().then(bugs => {
    bugs.sort((a, b) => b.createdAt - a.createdAt)
    const rows = bugs.map(({ title, description, severity }) => [title, description, severity])
    const headers = ['Title', 'Description', 'Severity']

    const fileName = 'bugs'
    pdfService
      .createPdf({ headers, rows, title: 'Bugs report', fileName })
      .then(() => {
        res.setHeader('Content-Type', 'application/pdf')
        res.sendFile(`${process.cwd()}/pdfs/${fileName}.pdf`)
      })
      .catch(err => {
        console.error(err)
        loggerService.error('Cannot download Pdf', err)
        res.send('We have a problem, try agin soon')
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
      res.status(404).send('Invalid Credentials')
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
      res.status(400).send('Cannot signup')
    }
  })
})

app.post('/api/user', (req, res) => {
  const user = userService.validateToken(req.cookies.loginToken)
  if (!user && !user.isAdmin) return res.status(401).send('Unauthenticated')
  userService.query().then(users => res.send(users))
})
app.get('/api/user/:userId/', (req, res) => {
  const { userId } = req.params
  const user = userService.validateToken(req.cookies.loginToken)
  if (!user) return res.status(401).send('Unauthenticated')

  userService.getById(userId).then(user => res.send(user))
})

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('loginToken')
  res.send('logged-out!')
})

app.get('/*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'))
})
function manageVisitedBugs(req, res, next) {
  let visitedBugs = req.cookies.visitedBugs || []
  const { bugId } = req.params

  if (!visitedBugs.includes(bugId)) {
    visitedBugs.push(bugId)
  }
  if (visitedBugs.length > 3) {
    loggerService.error(`User visited more than 3 bugs: ${visitedBugs}`)
    return res.status(401).send('Wait for a bit')
  }

  res.cookie('visitedBugs', visitedBugs, { maxAge: 7 * 1000 })

  next()

  console.log('User visited the following bugs:', visitedBugs)
}
