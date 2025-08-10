import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')  
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
      <div className="text-center max-w-4xl w-full">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-white  mb-12">
          Vote For 🙌 
        </h1>
        
        {/* Voting Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Link
            to="/president"
            className="group bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-8 py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-blue-500/25"
          >
            <div className="text-4xl mb-3">👑</div>
            <h3 className="text-xl font-bold mb-2">Presidential Vote</h3>
          
          </Link>

          <Link
            to="/treasury"
            className="group bg-gradient-to-r from-emerald-500 to-green-700 hover:from-emerald-600 hover:to-green-800 text-white px-8 py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-emerald-500/25"
          >
            <div className="text-4xl mb-3">💰</div>
            <h3 className="text-xl font-bold mb-2">Treasury Vote</h3>
          
          </Link>

          <Link
            to="/secretary"
            className="group bg-gradient-to-r from-purple-500 to-violet-700 hover:from-purple-600 hover:to-violet-800 text-white px-8 py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-purple-500/25"
          >
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-xl font-bold mb-2">Secretary Vote</h3>
          
          </Link>

          <Link
            to="/vice"
            className="group bg-gradient-to-r from-orange-500 to-red-700 hover:from-orange-600 hover:to-red-800 text-white px-8 py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-orange-500/25"
          >
            <div className="text-4xl mb-3">🤝</div>
            <h3 className="text-xl font-bold mb-2">Vice President</h3>
          
          </Link>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition duration-300"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default Home
