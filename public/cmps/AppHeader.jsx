const { useEffect, useState } = React
const { NavLink, useNavigate, Link } = ReactRouterDOM

import { userService } from '../services/user.service.js'
import { LoginSignup } from './LoginSignup.jsx'
import { UserMsg } from './UserMsg.jsx'

export function AppHeader() {
  const navigate = useNavigate()
  const [user, setUser] = useState(userService.getLoggedinUser())

  function onLogout() {
    userService
      .logout()
      .then(() => onSetUser(null))
      .catch(err => showErrorMsg('OOPs try again'))
  }

  function onSetUser(user) {
    setUser(user)
    navigate('/')
  }
  return (
    <header>
      <UserMsg />
      <nav>
        <NavLink to="/">Home</NavLink> |<NavLink to="/bug">Bugs</NavLink> |<NavLink to="/about">About</NavLink>
      </nav>
      <h1>Bugs are Forever</h1>
      {user ? (
        <section style={{ display: 'flex', gap: '1em', alignItems: 'center' }}>
          {user.isAdmin && (
            <Link className="btn" to="bug/users">
              users
            </Link>
          )}
          <Link style={{ color: 'white' }} to={`/user/${user._id}`}>
            Hello {user.fullname}
          </Link>
          <button className="btn" onClick={onLogout}>
            Logout
          </button>
        </section>
      ) : (
        <section>
          <LoginSignup onSetUser={onSetUser} />
        </section>
      )}
    </header>
  )
}
