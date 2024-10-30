import fs from 'fs'
import PDFDocument from 'pdfkit-table'
import { utilService } from './util.service.js'

const bugs = utilService.readJsonFile('data/bugs.json')

export const bugService = {
  query,
  getById,
  save,
  remove,
  generatePdfStream
}

function query() {
  return Promise.resolve(bugs)
}
function getById(bugId) {
  const bug = bugs.find((bug) => bug._id === bugId)
  if (!bug) return Promise.reject('cannot find bug' + bugId)
  return Promise.resolve(bug)
}

function remove(bugId) {
  const bugIdx = bugs.findIndex((bug) => bug._id === bugId)
  bugs.splice(bugIdx, 1)
  return _saveBugsToFile()
}

function save(bugToSave) {
  if (bugToSave._id) {
    const bugIdx = bugs.findIndex((bug) => bug._id === bugToSave._id)
    bugs[bugIdx] = bugToSave
  } else {
    bugToSave._id = utilService.makeId()
    bugs.unshift(bugToSave)
  }
  return _saveBugsToFile().then(() => bugToSave)
}

function _saveBugsToFile() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(bugs, null, 4)
    fs.writeFile('data/bugs.json', data, (err) => {
      if (err) {
        return reject(err)
      }
      resolve()
    })
  })
}
function generatePdfStream() {
  const bugs = utilService.readJsonFile('data/bugs.json')
  const doc = new PDFDocument({ margin: 30, size: 'A4' })

  const SortedBugs = bugs.sort((a, b) => b.createdAt - a.createdAt)
  const tableRows = SortedBugs.map(({ title, description, severity }) => [title, description, severity])

  const table = {
    title: 'Bugs Report',
    subtitle: 'Sorted by Creation Time',
    headers: ['Title', 'Description', 'Severity'],
    rows: tableRows
  }

  doc.table(table, {
    prepareHeader: () => doc.fontSize(12).font('Helvetica-Bold'),
    prepareRow: (row, i) =>
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor(i % 2 ? 'black' : 'gray')
  })

  doc.end()
  return doc
}
// const STORAGE_KEY = 'bugDB'
// _createBugs()

// function _createBugs() {
//   let bugs = utilService.loadFromStorage(STORAGE_KEY)
//   if (!bugs || !bugs.length) {
//     bugs = [
//       {
//         title: 'Infinite Loop Detected',
//         severity: 4,
//         _id: '1NF1N1T3'
//       },
//       {
//         title: 'Keyboard Not Found',
//         severity: 3,
//         _id: 'K3YB0RD'
//       },
//       {
//         title: '404 Coffee Not Found',
//         severity: 2,
//         _id: 'C0FF33'
//       },
//       {
//         title: 'Unexpected Response',
//         severity: 1,
//         _id: 'G0053'
//       }
//     ]
//     utilService.saveToStorage(STORAGE_KEY, bugs)
//   }
// }
