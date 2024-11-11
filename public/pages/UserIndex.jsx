import { userService } from '../services/user.service.js'

const { useState, useEffect } = React

export function UserIndex() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    userService.getUsersList().then(users => setUsers(users))
  }, [])

  if (!users) return <h1>loadings....</h1>

  return (
    <ul>
      {users.map(user => (
        <li key={user._id}>
          id: {user._id}
          fullname: {user.fullname}
          username: {user.username}
        </li>
      ))}
    </ul>
  )
}
