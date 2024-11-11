const { useState, useEffect } = React
const { Link, useParams } = ReactRouterDOM

import { userService } from '../services/user.service.js'
import { showErrorMsg } from '../services/event-bus.service.js'
import { BugList } from '../cmps/BugList.jsx'
import { bugService } from '../services/bug.service.js'

export function UserDetails() {
  const [user, setUser] = useState(null)
  const [bugs, setBugs] = useState(null)

  const { userId } = useParams()

  useEffect(() => {
    userService
      .getById(userId)
      .then(user => {
        setUser(user)
        getOwnedBugs(user)
      })
      .catch(err => {
        showErrorMsg('Cannot load user')
      })
  }, [])

  function getOwnedBugs(user) {
    bugService.query().then(bugs => {
      const ownedBugs = bugs.filter(bug => bug.owner._id === user._id)
      setBugs(ownedBugs)
    })
  }
  console.log(bugs)

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

  if (!user) return <h1>loadings....</h1>
  return (
    <div>
      <p>
        <span className="highlight">id:</span>
        {user._id}
      </p>
      <p>
        <span className="highlight">fullname:</span>

        {user.fullname}
      </p>
      <p>
        <span className="highlight"> username:</span>
        {user.username}
      </p>

      <BugList bugs={bugs} onRemoveBug={onRemoveBug} />
    </div>
  )
}
