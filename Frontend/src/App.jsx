import { useState } from 'react'
import './App.css'
import Login from './components/Login'
import LandingPage from './components/landingPage'
import Header from './components/Header'
import StreamList from './components/StreamList'
import StreamerPage from './components/StreamerPage'
import WatchStream from './components/WatchStream'
import SignUp from './components/SignUp'
import { ToastContainer } from 'react-toastify'
import { Outlet } from 'react-router-dom'

function App() {

  return (
      <div>
            <Header />
            <Outlet />
      </div>
    
  )
}

export default App
