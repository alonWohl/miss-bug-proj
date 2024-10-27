export const bugService = {
  query,
  save,
  remove,
  save,
  getById
}

const BASE_URL = '/api/bug/'

function query(filterBy = {}) {
  return axios
    .get(BASE_URL)
    .then((res) => res.data)
    .then((bugs) => {
      return bugs
    })
  // .then((bugs) => {
  //   if (filterBy.txt) {
  //     const regExp = new RegExp(filterBy.txt, 'i')
  //     bugs = bugs.filter((bug) => regExp.test(bug.vendor))
  //   }
  //   if (filterBy.minSpeed) {
  //     bugs = bugs.filter((bug) => bug.speed >= filterBy.minSpeed)
  //   }
  // })
  return bugs
}

function getById(bugId) {
  return axios.get(BASE_URL + bugId).then((res) => res.data)
}

function remove(bugId) {
  return axios.get(BASE_URL + bugId + '/remove').then((res) => res.data)
}

function save(bug) {
  const url = BASE_URL + 'save'
  let queryParams = `?title=${bug.title}&severity=${bug.severity}`
  if (bug._id) queryParams += `&_id=${bug._id}`
  return axios
    .get(url + queryParams)
    .then((res) => res.data)
    .catch((err) => {
      console.log('err:', err)
    })
}
