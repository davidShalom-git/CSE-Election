import React, { useState, useEffect, useCallback } from 'react'

const candidateData = [
  { id: 1, name: 'John Doe', description: 'Experienced leader.', motto: 'For the people', party: 'People Party', image: '👨‍💼', color: 'from-blue-500 via-blue-600 to-blue-700' },
  { id: 2, name: 'Jane Smith', description: 'Visionary and dedicated.', motto: 'Future first', party: 'Future Forward', image: '👩‍💼', color: 'from-emerald-500 via-green-600 to-teal-700' },
  { id: 3, name: 'Robert Lee', description: 'Committed to excellence.', motto: 'Excellence always', party: 'Independent Party', image: '👨‍🎓', color: 'from-purple-500 via-violet-600 to-indigo-700' }
]

const President = () => {
  const [token] = useState(() => localStorage.getItem('token'))
  const [userStatus, setUserStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVoting, setIsVoting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [voteToggle, setVoteToggle] = useState(false)

  const role = 'president'

  const fetchUserStatus = useCallback(async () => {
    if (!token) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`http://localhost:1200/api/vote/user-status/${role}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setUserStatus(data)
      } else {
        setError(data.message || 'Failed to load user status')
      }
    } catch {
      setError('Network error while loading status')
    }
    setIsLoading(false)
  }, [role, token])

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

    try {
      const res = await fetch(`http://localhost:1200/api/vote/vote/${role}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ candidate: candidateName })
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(`Successfully voted for "${candidateName}"!`)
        setVoteToggle(v => !v)
      } else {
        setError(data.message || 'Vote failed')
      }
    } catch {
      setError('Network error')
    }
    setIsVoting(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 px-2">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full mb-4 sm:mb-6 shadow-2xl animate-pulse">
            <span className="text-2xl sm:text-4xl">🗳️</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent leading-tight capitalize">
            Presidential Voting System
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-purple-200 px-4">
            {userStatus?.hasVoted
              ? `Thank you for casting your vote for ${userStatus.votedFor}!`
              : `Cast your vote for your preferred presidential candidate`}
          </p>
          <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-purple-500 to-blue-600 mx-auto mt-4 sm:mt-6 rounded-full"></div>
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
                className="group bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl overflow-hidden border border-white/20 shadow-2xl hover:bg-white/20 transition-all duration-500 hover:scale-102 sm:hover:scale-105 hover:shadow-purple-500/25"
                style={{ animation: `slideInUp 0.6s ease-out ${idx * 0.15}s both` }}
              >
                <div className={`bg-gradient-to-br ${candidate.color} p-6 text-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="text-5xl mb-3 filter drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">{candidate.image}</div>
                    <h3 className="text-xl font-bold text-white mb-1">{candidate.name}</h3>
                    <p className="text-white/90 text-sm font-medium mb-2">{candidate.party}</p>
                    <div className="w-14 h-1 bg-white/50 mx-auto rounded-full" />
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-purple-200 text-sm mb-3 leading-relaxed">{candidate.description}</p>
                  <p className="text-white font-medium italic text-center bg-white/5 py-2 px-3 rounded-full border border-white/10 text-xs">"{candidate.motto}"</p>
                  <button
                    onClick={() => handleVote(candidate.name)}
                    disabled={isVoting}
                    className={`mt-6 w-full py-3 rounded-full font-bold text-white text-base shadow-2xl transition duration-300 ${
                      isVoting
                        ? 'bg-gray-500/50 cursor-not-allowed text-gray-300'
                        : `bg-gradient-to-r ${candidate.color} hover:shadow-3xl hover:shadow-purple-500/50 transform hover:scale-105 active:scale-95`
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
            <p className="text-lg text-purple-200 mb-4">
              You voted for: <span className="font-bold text-transparent bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text">{userStatus.votedFor}</span>
            </p>
            {userStatus.votedAt && (
              <p className="text-purple-300 bg-white/5 inline-block px-6 py-2 rounded-full border border-white/10 text-sm">
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

export default President
