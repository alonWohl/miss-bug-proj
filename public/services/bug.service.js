export const bugService = {
  query,
  save,
  remove,
  save,
  getById,
  getDefaultFilter,
  downloadPdf
}

const BASE_URL = '/api/bug/'

function query(filterBy = {}) {
  return axios
    .get(BASE_URL)
    .then((res) => res.data)
    .then((bugs) => {
      let filteredBugs = bugs
      if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        filteredBugs = filteredBugs.filter((bug) => regExp.test(bug.title))
      }
      if (filterBy.minSeverity) {
        filteredBugs = filteredBugs.filter((bug) => bug.severity >= filterBy.minSeverity)
      }
      return filteredBugs
    })
}

function getById(bugId) {
  return axios.get(BASE_URL + bugId).then((res) => res.data)
}

function remove(bugId) {
  return axios.get(BASE_URL + bugId + '/remove').then((res) => res.data)
}

function save(bug) {
  const url = BASE_URL + 'save'
  let queryParams = `?title=${bug.title}&severity=${bug.severity}&description=${bug.description}`
  if (bug._id) queryParams += `&_id=${bug._id}`
  return axios
    .get(url + queryParams)
    .then((res) => res.data)
    .catch((err) => {
      console.log('err:', err)
    })
}

function getDefaultFilter() {
  return { txt: '', minSeverity: 0 }
}

function downloadPdf() {
  axios({
    url: '/api/bug/pdf',
    method: 'GET',
    responseType: 'blob'
  })
    .then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))

      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'bugs.pdf')
      document.body.appendChild(link)
      link.click()

      link.remove()
      window.URL.revokeObjectURL(url)
    })
    .catch((error) => {
      console.error('Error downloading PDF:', error)
    })
}
