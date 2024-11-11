import { bugService } from '../services/bug.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { BugList } from '../cmps/BugList.jsx'
import { BugFilter } from '../cmps/BugFilter.jsx'
import { userService } from '../services/user.service.js'

const { useState, useEffect } = React
const { Link } = ReactRouterDOM

export function BugIndex() {
  const user = userService.getLoggedinUser()

  const [bugs, setBugs] = useState(null)
  const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())

  useEffect(() => {
    loadBugs()
  }, [filterBy])

  function loadBugs() {
    bugService
      .query(filterBy)
      .then(setBugs)
      .catch(err => {
        showErrorMsg('cant load bugs')
        console.error(err)
      })
  }

  function onRemoveBug(bugId) {
    bugService
      .remove(bugId)
      .then(() => {
        console.log('Deleted Succesfully!')
        const bugsToUpdate = bugs.filter(bug => bug._id !== bugId)
        setBugs(bugsToUpdate)
        showSuccessMsg('Bug removed')
      })
      .catch(err => {
        console.log('Error from onRemoveBug ->', err)
        showErrorMsg('Cannot remove bug')
      })
  }

  function onDownloadPdf() {
    bugService.downloadPdf().then(window.open('/pdf')).catch(console.error)
  }

  function onSetFilterBy(newFilterBy) {
    setFilterBy(prevFilterBy => ({ ...prevFilterBy, ...newFilterBy }))
  }

  function onSetSortBy(sortBy) {
    setFilterBy(prevFilterBy => ({
      ...prevFilterBy,
      sortBy: { ...prevFilterBy.sortBy, sortBy }
    }))
  }

  function onChangePageIdx(diff) {
    setFilterBy(prevFilter => ({ ...prevFilter, pageIdx: prevFilter.pageIdx + diff }))
  }

  return (
    <main>
      <section className="info-actions">
        <h3>Bugs App</h3>
        <BugFilter filterBy={filterBy} onSetFilterBy={onSetFilterBy} onSetSortBy={onSetSortBy} />
        {user && (
          <Link className="btn" to="/bug/edit">
            Add Bug ⛐
          </Link>
        )}
        <button className="btn" onClick={onDownloadPdf}>
          Download PDF
        </button>
      </section>
      <main>
        <button
          className="btn"
          onClick={() => {
            onChangePageIdx(1)
          }}>
          +
        </button>
        {filterBy.pageIdx + 1 || ''}
        <button
          className="btn"
          onClick={() => {
            onChangePageIdx(-1)
          }}
          disabled={filterBy.pageIdx === 0}>
          -
        </button>
        <BugList bugs={bugs} onRemoveBug={onRemoveBug} />
      </main>
    </main>
  )
}
