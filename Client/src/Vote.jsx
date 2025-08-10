import React, { useState, useEffect, useCallback } from 'react';

const Vote = () => {
  const [token] = useState(() => localStorage.getItem('token'));
  const [userStatus, setUserStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [voteSubmitted, setVoteSubmitted] = useState(false);

  
  const fetchUserStatus = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:1200/api/vote/user-status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setUserStatus(data);
      } else {
        setError(data.message || 'Failed to load user status');
      }
    } catch {
      setError('Network error while loading user status');
    }
  }, [token]);

 
  const fetchCandidates = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:1200/api/vote/candidates');
      const data = await response.json();
      if (response.ok && data.success) {
      
        const styledCandidates = data.candidates.map((candidate, idx) => ({
          id: candidate._id,
          name: candidate.name,
          description: candidate.description,
          motto: candidate.motto,
          party: candidate.party || 'Independent Party',
          image: ['👨‍💼', '👩‍💼', '👨‍🎓'][idx % 3],
          color: ['from-blue-500 via-blue-600 to-blue-700', 'from-emerald-500 via-green-600 to-teal-700', 'from-purple-500 via-violet-600 to-indigo-700'][idx % 3]
        }));
        setCandidates(styledCandidates);
      } else {
        setError(data.message || 'Failed to load candidates');
      }
    } catch {
      setError('Network error while fetching candidates');
    } finally {
      setCandidatesLoading(false);
    }
  }, []);


  useEffect(() => {
    if (token) {
      setIsLoading(true);
      fetchUserStatus();
      fetchCandidates();
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [token, voteSubmitted, fetchUserStatus, fetchCandidates]);


  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

 
  const handleVote = async (candidateName) => {
    if (userStatus?.hasVoted) {
      setError('You have already voted!');
      return;
    }

    setIsVoting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('http://localhost:1200/api/vote/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ candidate: candidateName })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(`Vote recorded successfully for ${candidateName}!`);
        setUserStatus(prev => ({
          ...prev,
          hasVoted: true,
          votedFor: candidateName,
          votedAt: new Date().toISOString()
        }));
        setVoteSubmitted(prev => !prev);
      } else {
        setError(data.message || 'Failed to record vote');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

 
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.replace('/');
  };


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
    );
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
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 px-2">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full mb-4 sm:mb-6 shadow-2xl animate-pulse">
            <span className="text-2xl sm:text-4xl">🗳️</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent leading-tight">
            Digital Voting System
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-purple-200 px-4">
            {userStatus?.hasVoted ? 'Thank you for participating in democracy!' : 'Cast your vote for your preferred candidate'}
          </p>
          <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-purple-500 to-blue-600 mx-auto mt-4 sm:mt-6 rounded-full"></div>
        </div>

        {userStatus && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300 mx-2 sm:mx-0">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-6 text-center sm:text-left">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-lg sm:text-2xl">👤</span>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2">
                    Welcome, {userStatus.Email || userStatus.email || 'User'}
                  </h3>
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
                    <span className="text-purple-200 text-sm sm:text-base">Status:</span>
                    {userStatus.hasVoted ? (
                      <span className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-green-500/20 text-green-300 border border-green-500/30 shadow-lg">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                        ✅ Vote Recorded
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-lg">
                        <span className="w-2 h-2 bg-amber-400 rounded-full mr-2 animate-pulse"></span>
                        ⏳ Awaiting Vote
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-full hover:from-red-600 hover:to-pink-700 transition-all duration-300 font-semibold text-sm sm:text-base shadow-lg hover:shadow-red-500/25 transform hover:scale-105"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 shadow-2xl animate-pulse mx-2 sm:mx-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center">
              <span className="text-2xl sm:text-3xl mr-0 sm:mr-4 mb-2 sm:mb-0 flex-shrink-0">❌</span>
              <div>
                <div className="font-semibold text-base sm:text-lg">Error</div>
                <div className="text-sm sm:text-base">{error}</div>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 backdrop-blur-md border border-green-500/30 text-green-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 shadow-2xl animate-pulse mx-2 sm:mx-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center">
              <span className="text-2xl sm:text-3xl mr-0 sm:mr-4 mb-2 sm:mb-0 flex-shrink-0">✅</span>
              <div>
                <div className="font-semibold text-base sm:text-lg">Success!</div>
                <div className="text-sm sm:text-base">{success}</div>
              </div>
            </div>
          </div>
        )}

        {!userStatus?.hasVoted ? (
          <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 mb-8 sm:mb-12 px-2 sm:px-0">
            {candidatesLoading ? (
              <p className="text-center text-purple-300 mt-8">Loading candidates...</p>
            ) : (
              candidates.map((candidate, idx) => (
                <div
                  key={candidate.id}
                  className="group bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl overflow-hidden border border-white/20 shadow-2xl hover:bg-white/20 transition-all duration-500 hover:scale-102 sm:hover:scale-105 hover:shadow-purple-500/25"
                  style={{
                    animation: `slideInUp 0.6s ease-out ${idx * 0.15}s both`
                  }}
                >
                  <div className={`bg-gradient-to-br ${candidate.color} p-4 sm:p-6 lg:p-8 text-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    <div className="relative z-10">
                      <div className="text-4xl sm:text-5xl lg:text-7xl mb-2 sm:mb-4 filter drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">{candidate.image}</div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2">{candidate.name}</h3>
                      <p className="text-white/90 text-sm sm:text-base lg:text-lg font-medium mb-2">{candidate.party}</p>
                      <div className="w-12 sm:w-16 h-1 bg-white/50 mx-auto rounded-full"></div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 lg:p-8">
                    <div className="mb-4 sm:mb-6">
                      <p className="text-purple-200 text-sm sm:text-base lg:text-lg mb-2 sm:mb-3 leading-relaxed">{candidate.description}</p>
                      <p className="text-white font-medium italic text-center bg-white/5 py-2 px-3 sm:px-4 rounded-full border border-white/10 text-xs sm:text-sm lg:text-base">"{candidate.motto}"</p>
                    </div>
                    <button
                      onClick={() => handleVote(candidate.name)}
                      disabled={isVoting}
                      className={`w-full py-3 sm:py-4 px-4 sm:px-6 lg:px-8 rounded-full font-bold text-sm sm:text-base lg:text-lg transition-all duration-300 shadow-2xl ${isVoting ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed' : `bg-gradient-to-r ${candidate.color} text-white hover:shadow-3xl transform hover:scale-105 active:scale-95 hover:shadow-purple-500/50`}`}
                    >
                      {isVoting ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Voting...
                        </div>
                      ) : (
                        '🗳️ Cast Vote'
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 mb-8 sm:mb-12 text-center border border-white/20 shadow-2xl mx-2 sm:mx-0">
            <div className="text-5xl sm:text-6xl lg:text-8xl mb-4 sm:mb-6 animate-bounce">🎉</div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4">Vote Successfully Recorded!</h3>
            <p className="text-lg sm:text-xl lg:text-2xl text-purple-200 mb-4 sm:mb-6">
              You voted for: <span className="font-bold text-transparent bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text">{userStatus.votedFor}</span>
            </p>
            {userStatus.votedAt && (
              <p className="text-sm sm:text-base lg:text-lg text-purple-300 bg-white/5 inline-block px-4 sm:px-6 py-2 rounded-full border border-white/10">
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
  );
};

export default Vote;
