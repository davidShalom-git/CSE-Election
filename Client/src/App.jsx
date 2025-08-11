import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from '../Components/Home'
import President from '../Components/President'
import Vice from '../Components/Vice'
import Secretary from '../Components/Secretary'
import Treasury from '../Components/Treasury'
import SignIn from '../Auth/SignIn'

// Use sessionStorage instead of localStorage for better reliability
const getToken = () => sessionStorage.getItem('token')

// Protected routes - only accessible with valid token
const ProtectedRoute = ({ children }) => {
  const token = getToken()
  
  if (!token) {
    console.log('No token found, redirecting to login')
    return <Navigate to="/" replace />
  }
  
  console.log('Token found, rendering protected component')
  return children
}

// Public routes - redirect authenticated users to home
const PublicRoute = ({ children }) => {
  const token = getToken()
  
  if (token) {
    console.log('Already logged in, redirecting to home')
    return <Navigate to="/home" replace />
  }
  
  return children
}

const App = () => {
  // Add debugging
  console.log('App rendering, current path:', window.location.pathname)
  console.log('Token exists:', !!getToken())

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

        {/* Catch-all route - FIXED: Redirect to login if no token, home if has token */}
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