const Router = ReactRouterDOM.BrowserRouter
const { Route, Routes } = ReactRouterDOM

import { AppHeader } from './cmps/AppHeader.jsx'
import { AppFooter } from './cmps/AppFooter.jsx'
import { Home } from './pages/Home.jsx'
import { BugIndex } from './pages/BugIndex.jsx'
import { BugDetails } from './pages/BugDetails.jsx'
import { AboutUs } from './pages/AboutUs.jsx'
import { BugEdit } from './pages/BugEdit.jsx'
import { UserIndex } from './pages/UserIndex.jsx'
import { UserDetails } from './pages/UserDetails.jsx'

export function App() {
  return (
    <Router>
      <div className="main-app">
        <AppHeader />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/bug" element={<BugIndex />} />
            <Route path="/bug/edit/:bugId" element={<BugEdit />} />
            <Route path="/bug/edit" element={<BugEdit />} />
            <Route path="/bug/users" element={<UserIndex />} />
            <Route path="/bug/:bugId" element={<BugDetails />} />
            <Route path="/user/:userId" element={<UserDetails />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="*" element={<div>Page Not Found</div>} />
          </Routes>
        </main>
        <AppFooter />
      </div>
    </Router>
  )
}
