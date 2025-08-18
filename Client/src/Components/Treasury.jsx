import React, { useState, useEffect, useCallback } from 'react'
import photo1 from '../assets/kanch.png'

// For demo purposes, using placeholder images. Replace these with your actual imports

const photo2 = 'https://via.placeholder.com/200x200/6366f1/ffffff?text=Chris+Evans'

const candidateData = [
  { 
    id: 8, 
    name: 'Kanchana', 
    description: 'Financial expert.', 
    motto: 'Securing Funds, Powering Innovations', 
    party: 'Independent Party', 
    image: photo1, 
    color: 'from-red-500 via-red-600 to-red-700' 
  },
  { 
    id: 9, 
    name: 'Chris Evans', 
    description: 'Meticulous and fair.', 
    motto: 'Count on me', 
    party: 'Balance Party', 
    image: photo2, 
    color: 'from-indigo-500 via-indigo-600 to-indigo-700' 
  }
]

const Treasury = () => {
  // Mock token for demo - replace with your actual localStorage logic
  const [token] = useState('demo-token')
  const [userStatus, setUserStatus] = useState({ hasVoted: false })
  const [isLoading, setIsLoading] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [voteToggle, setVoteToggle] = useState(false)

  const role = 'treasury'

  // Mock functions for demo - replace with your actual API calls
  const fetchUserStatus = useCallback(async () => {
    // Your actual API call would go here
    setUserStatus({ hasVoted: false })
  }, [])

  useEffect(() => {
    fetchUserStatus()
  }, [fetchUserStatus, voteToggle])

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null)
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  const handleVote = async (candidateName) => {
    if (!token) {
      setError('Please log in to vote!')
      return
    }
    if (userStatus?.hasVoted) {
      setError('You already voted for this role!')
      return
    }

    setIsVoting(true)
    setError(null)
    setSuccess(null)

    // Simulate API call
    setTimeout(() => {
      setSuccess(`Successfully voted for "${candidateName}"!`)
      setUserStatus({ hasVoted: true, votedFor: candidateName, votedAt: new Date().toISOString() })
      setIsVoting(false)
    }, 1000)
  }

  const handleLogout = () => {
    // Your logout logic here
    window.location.replace('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-purple-300 border-t-transparent rounded-full animate-spin" />
            <div
              className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-300 border-b-transparent rounded-full animate-spin"
              style={{ animationDirection: 'reverse', animationDelay: '0.15s' }}
            />
          </div>
          <p className="text-lg sm:text-xl text-white font-medium">Loading voting data...</p>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border border-white/20 shadow-2xl max-w-md w-full">
          <div className="text-4xl sm:text-5xl lg:text-6xl mb-4 sm:mb-6">🔒</div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4">Authentication Required</h2>
          <p className="text-purple-200 mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg">Please log in to access the voting system.</p>
          <button
            onClick={() => window.location.replace('/')}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-full hover:from-purple-600 hover:to-blue-700 transition-all duration-300 font-semibold text-sm sm:text-base lg:text-lg shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-700 to-pink-900 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 px-2">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-red-500 to-pink-700 rounded-full mb-4 sm:mb-6 shadow-2xl animate-pulse">
            <span className="text-2xl sm:text-4xl">💰</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-red-300 to-pink-300 bg-clip-text text-transparent leading-tight capitalize">
            Treasury Voting System
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-red-200 px-4">
            {userStatus?.hasVoted
              ? `Thank you for casting your vote for ${userStatus.votedFor}!`
              : `Cast your vote for your preferred treasury candidate`}
          </p>
          <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-red-500 to-pink-600 mx-auto mt-4 sm:mt-6 rounded-full"></div>
        </div>

        {error && (
          <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-200 px-4 py-4 mb-6 rounded-2xl shadow-2xl animate-pulse">
            <strong>Error:</strong> {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 backdrop-blur-md border border-green-500/30 text-green-200 px-4 py-4 mb-6 rounded-2xl shadow-2xl animate-pulse">
            <strong>Success:</strong> {success}
          </div>
        )}

        {!userStatus?.hasVoted ? (
          <div className="grid gap-6 sm:gap-8 lg:gap-10 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 px-2 sm:px-0">
            {candidateData.map((candidate, idx) => (
              <div
                key={candidate.id}
                className={`group bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl overflow-hidden border border-white/20 shadow-2xl hover:bg-white/20 transition-all duration-500 hover:scale-102 sm:hover:scale-105 hover:shadow-red-500/25`}
                style={{ animation: `slideInUp 0.6s ease-out ${idx * 0.15}s both` }}
              >
                <div className={`bg-gradient-to-br ${candidate.color} p-6 text-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <div className="relative z-10">
                    {/* Updated photo display logic */}
                    <div className="mb-4 mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                      <img 
                        src={candidate.image} 
                        alt={candidate.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                      <div 
                        className="hidden w-full h-full bg-white/20 text-white text-xl font-bold items-center justify-center"
                        style={{ display: 'none' }}
                      >
                        {candidate.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{candidate.name}</h3>
                    <p className="text-white/90 text-sm font-medium mb-2">{candidate.party}</p>
                    <div className="w-14 h-1 bg-white/50 mx-auto rounded-full" />
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-red-200 text-sm mb-3 leading-relaxed">{candidate.description}</p>
                  <p className="text-white font-medium italic text-center bg-white/5 py-2 px-3 rounded-full border border-white/10 text-xs">"{candidate.motto}"</p>
                  <button
                    onClick={() => handleVote(candidate.name)}
                    disabled={isVoting}
                    className={`mt-6 w-full py-3 rounded-full font-bold text-white text-base shadow-2xl transition duration-300 ${
                      isVoting
                        ? 'bg-gray-500/50 cursor-not-allowed text-gray-300'
                        : `bg-gradient-to-r ${candidate.color} hover:shadow-3xl hover:shadow-red-500/50 transform hover:scale-105 active:scale-95`
                    }`}
                  >
                    {isVoting ? (
                      <div className="flex justify-center items-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Voting...
                      </div>
                    ) : (
                      '🗳️ Cast Vote'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20 shadow-2xl mx-2 sm:mx-0">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h3 className="text-3xl font-bold text-white mb-4">Vote Successfully Recorded!</h3>
            <p className="text-lg text-red-200 mb-4">
              You voted for: <span className="font-bold text-transparent bg-gradient-to-r from-red-300 to-pink-300 bg-clip-text">{userStatus.votedFor}</span>
            </p>
            {userStatus.votedAt && (
              <p className="text-red-300 bg-white/5 inline-block px-6 py-2 rounded-full border border-white/10 text-sm">
                📅 Voted on: {new Date(userStatus.votedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .scale-102 {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  )
}

export default Treasury