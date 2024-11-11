import { bugService } from '../services/bug.service.js'

const { useEffect, useState } = React
const { useNavigate, useParams } = ReactRouterDOM

export function BugEdit() {
  const [bugToEdit, setBugToEdit] = useState(bugService.getEmptyBug())
  const navigate = useNavigate()
  const params = useParams()

  useEffect(() => {
    if (params.bugId) loadBug()
  }, [])

  function loadBug() {
    bugService
      .getById(params.bugId)
      .then(setBugToEdit)
      .catch(err => showErrorMsg('Cannot load bug'))
  }

  function handleChange({ target }) {
    const field = target.name
    let value = target.value

    switch (target.type) {
      case 'number':
      case 'range':
        value = +value || ''
        break

      case 'checkbox':
        value = target.checked
        break

      default:
        break
    }

    setBugToEdit(prevBugToEdit => ({ ...prevBugToEdit, [field]: value }))
  }

  function onSaveBug(ev) {
    ev.preventDefault()

    bugService
      .save(bugToEdit)
      .then(() => navigate('/bug'))
      .catch(err => showErrorMsg('Cannot save bug'))
  }

  const { title, severity, description } = bugToEdit

  return (
    <section className="bug-edit">
      <form onSubmit={onSaveBug}>
        <label htmlFor="title">title:</label>
        <input onChange={handleChange} value={title} type="text" name="title" id="title" />

        <label htmlFor="severity">severity:</label>
        <input onChange={handleChange} value={severity} type="number" name="severity" id="severity" />

        <label htmlFor="description">description:</label>
        <input onChange={handleChange} value={description} type="text" name="description" id="description" />

        <button className="btn">Save</button>
      </form>
    </section>
  )
}
