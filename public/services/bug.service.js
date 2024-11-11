export const bugService = {
  query,
  save,
  remove,
  save,
  getById,
  getDefaultFilter,
  getEmptyBug,
  getFilterFromSearchParams,
  downloadPdf
}

const BASE_URL = '/api/bug/'

function query(filterBy = { txt: '', minSeverity: 0, pageIdx: 0, sortBy: { field: '', dir: 1 } }) {
  return axios
    .get(BASE_URL, { params: { ...filterBy } })
    .then(res => res.data)
    .catch(err => {
      console.error(err, 'cannot get bugs')
    })
}

function getById(bugId) {
  return axios
    .get(BASE_URL + bugId)
    .then(res => res.data)
    .catch(err => console.error('err', err))
}

function remove(bugId) {
  return axios.delete(BASE_URL + bugId).then(res => res.data)
}

function save(bug) {
  if (bug._id) {
    return axios
      .put(BASE_URL + bug._id, bug)
      .then(res => res.data)
      .catch(err => {
        console.log('err:', err)
        throw err
      })
  } else {
    return axios
      .post(BASE_URL, bug)
      .then(res => res.data)
      .catch(err => {
        console.log('err:', err)
        throw err
      })
  }
}

function downloadPdf() {
  return axios
    .get('/pdf')
    .then(res => res.data)
    .catch(err => {
      console.log(err)
      throw err
    })
}

function getDefaultFilter() {
  return { txt: '', minSeverity: 0, pageIdx: 0, sortBy: { field: 'createdAt', dir: 1 } }
}

function getEmptyBug() {
  return { title: '', severity: '', description: '' }
}

function getFilterFromSearchParams(searchParams) {
  const txt = searchParams.get('txt') || ''
  const minSeverity = searchParams.get('minSeverity') || ''
  return {
    txt,
    minSeverity
  }
}
