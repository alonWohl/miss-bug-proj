const { useEffect, useState } = React

export function BugFilter({ filterBy, onSetFilterBy, onSetSortBy }) {
  const [filterByToEdit, setFilterByToEdit] = useState({ ...filterBy })
  const [sortByToEdit, setSortByToEdit] = useState({ ...filterBy.sortBy })

  useEffect(() => {
    onSetFilterBy(filterByToEdit)
  }, [filterByToEdit])

  useEffect(() => {
    onSetSortBy(sortByToEdit)
  }, [sortByToEdit])

  function handleChange({ target }) {
    const field = target.name
    let value = target.value

    switch (target.type) {
      case 'number':
      case 'range':
        value = +value
        break
      case 'checkbox':
        value = target.checked
        break
    }
    setFilterByToEdit((prevFilter) => ({ ...prevFilter, [field]: value }))
    setSortByToEdit((prevFilter) => ({ ...prevFilter, [field]: value }))
  }

  function onSubmit(ev) {
    ev.preventDefault()
    console.log('Form submitted')
  }

  const { txt, minSeverity } = filterByToEdit

  return (
    <fieldset>
      <legend>Filter</legend>
      <form className="bug-filter" onSubmit={onSubmit}>
        <input onChange={handleChange} name="txt" id="txt" value={txt || ''} type="text" placeholder="Search bugs..." />
        <label htmlFor="minSeverity">By severity</label>
        <input onChange={handleChange} name="minSeverity" value={minSeverity || 0} type="range" min="0" max="10" id="minSeverity" />
        <label htmlFor="minSeverity">{filterBy.minSeverity}</label>

        <label htmlFor="sortField">Sort by:</label>
        <select name="field" onChange={handleChange} value={sortByToEdit.field}>
          <option value="title">Title</option>
          <option value="createdAt">Date Created</option>
          <option value="severity">Severity</option>
        </select>

        <label htmlFor="sortDir">Order:</label>
        <select name="dir" onChange={handleChange} value={sortByToEdit.dir === 1 ? 'asc' : 'desc'}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </form>
    </fieldset>
  )
}
