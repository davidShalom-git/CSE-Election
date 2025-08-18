import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './Components/Home'
import President from './Components/President'
import Vice from './Components/Vice'
import Secretary from './Components/Secretary'
import Treasury from './Components/Treasury'
import SignIn from './Auth/SignIn'

const getToken = () => localStorage.getItem('token')


const ProtectedRoute = ({ children }) => {
  const token = getToken()
  if (!token) {
   
    return <Navigate to="/" replace />
  }
  return children
}

// Public routes like login redirect authenticated users to home
const PublicRoute = ({ children }) => {
  const token = getToken()
  if (token) {
    // Already logged in, redirect to home
    return <Navigate to="/home" replace />
  }
  return children
}

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public login route */}
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <SignIn />
            </PublicRoute>
          } 
        />

        {/* Protected routes */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/president" 
          element={
            <ProtectedRoute>
              <President />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/vice" 
          element={
            <ProtectedRoute>
              <Vice />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/secretary" 
          element={
            <ProtectedRoute>
              <Secretary />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/treasury" 
          element={
            <ProtectedRoute>
              <Treasury />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all route: Redirect to home if logged in, else redirect to login */}
        <Route 
          path="*" 
          element={
            getToken() ? <Navigate to="/home" replace /> : <Navigate to="/" replace />
          } 
        />
      </Routes>
    </Router>
  )
}

export default App
