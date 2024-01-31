import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Route, Router, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import Login from './components/Login.jsx'
import SignUp from './components/SignUp.jsx'
import StreamList from './components/StreamList.jsx'
import WatchStream from './components/WatchStream.jsx'
import LandingPage from './components/landingPage.jsx'
import StreamerPage from './components/StreamerPage.jsx'

const router=createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path='' element={<Login/>} />
      <Route path='login' element={<Login/>} />
      <Route path='signin' element={<SignUp/>} />
      <Route path='streams' element={<StreamList/>} />  
      <Route path='watch' element={<WatchStream/>} /> 
      <Route path='landing' element={<LandingPage/>} />
      <Route path='streamer' element={<StreamerPage/>} />  
    </Route>
  )
)

ReactDOM.createRoot(document.getElementById('root')).render(
    <RouterProvider router={router} />
)
