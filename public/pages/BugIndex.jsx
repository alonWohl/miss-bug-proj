import { bugService } from '../services/bug.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { BugList } from '../cmps/BugList.jsx'
import { BugFilter } from '../cmps/BugFilter.jsx'

const { useState, useEffect } = React

export function BugIndex() {
  const [bugs, setBugs] = useState(null)
  const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())

  useEffect(() => {
    loadBugs()
  }, [filterBy])

  function loadBugs() {
    bugService
      .query(filterBy)
      .then(setBugs)
      .catch((err) => {
        showErrorMsg('cant load bugs')
        console.error(err)
      })
  }

  function onRemoveBug(bugId) {
    bugService
      .remove(bugId)
      .then(() => {
        console.log('Deleted Succesfully!')
        const bugsToUpdate = bugs.filter((bug) => bug._id !== bugId)
        setBugs(bugsToUpdate)
        showSuccessMsg('Bug removed')
      })
      .catch((err) => {
        console.log('Error from onRemoveBug ->', err)
        showErrorMsg('Cannot remove bug')
      })
  }

  function onAddBug() {
    const bug = {
      title: prompt('Bug title?'),
      severity: +prompt('Bug severity?')
    }
    bugService
      .save(bug)
      .then((savedBug) => {
        console.log('Added Bug', savedBug)
        setBugs([...bugs, savedBug])
        showSuccessMsg('Bug added')
      })
      .catch((err) => {
        console.log('Error from onAddBug ->', err)
        showErrorMsg('Cannot add bug')
      })
  }

  function onEditBug(bug) {
    const severity = +prompt('New severity?', bug._id ? bug.severity : '')
    const description = prompt('Edit Desctiption', bug._id ? bug.description : '')
    const bugToSave = { ...bug, severity, description }
    bugService
      .save(bugToSave)
      .then((savedBug) => {
        console.log('Updated Bug:', savedBug)
        const bugsToUpdate = bugs.map((currBug) => (currBug._id === savedBug._id ? savedBug : currBug))
        setBugs(bugsToUpdate)
        showSuccessMsg('Bug updated')
      })
      .catch((err) => {
        console.log('Error from onEditBug ->', err)
        showErrorMsg('Cannot update bug')
      })
  }

  function onDownloadPdf() {
    bugService
      .downloadPdf()
      .then(() => {
        console.log('PDF Downloaded')
      })
      .catch((err) => {
        console.error('Failed to generate PDF:', err)
      })
  }

  function onSetFilterBy(newFilterBy) {
    setFilterBy((prevFilterBy) => ({ ...prevFilterBy, ...newFilterBy }))
  }

  return (
    <main>
      <section className="info-actions">
        <h3>Bugs App</h3>
        <BugFilter filterBy={filterBy} onSetFilterBy={onSetFilterBy} />
        <button onClick={onAddBug}>Add Bug ⛐</button>
        <button onClick={onDownloadPdf}>Download PDF</button>
      </section>
      <main>
        <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />
      </main>
    </main>
  )
}
