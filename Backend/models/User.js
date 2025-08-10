const mongoose = require('mongoose');


const voteStatusSchema = new mongoose.Schema({
  hasVoted: {
    type: Boolean,
    default: false
  },
  votedAt: {
    type: Date,
    default: null
  },
  votedFor: {
    type: String,
    default: null
  }
}, { _id: false }); 


const userSchema = new mongoose.Schema({
  Email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, 
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  Password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['voter', 'admin'],
    default: 'voter'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  votes: {
    president: {
      type: voteStatusSchema,
      default: () => ({ hasVoted: false, votedAt: null, votedFor: null })
    },
    vicePresident: {
      type: voteStatusSchema,
      default: () => ({ hasVoted: false, votedAt: null, votedFor: null })
    },
    secretary: {
      type: voteStatusSchema,
      default: () => ({ hasVoted: false, votedAt: null, votedFor: null })
    },
    treasury: {
      type: voteStatusSchema,
      default: () => ({ hasVoted: false, votedAt: null, votedFor: null })
    }
  }
}, {
  timestamps: true,
  collection: 'users'
});


userSchema.index({ isActive: 1 });
userSchema.index({ 'votes.president.hasVoted': 1 });
userSchema.index({ 'votes.vicePresident.hasVoted': 1 });
userSchema.index({ 'votes.secretary.hasVoted': 1 });
userSchema.index({ 'votes.treasury.hasVoted': 1 });


userSchema.pre('save', function(next) {
  const roles = ['president', 'vicePresident', 'secretary', 'treasury'];
  if (!this.votes) this.votes = {};
  roles.forEach(role => {
    if (!this.votes[role]) {
      this.votes[role] = { hasVoted: false, votedAt: null, votedFor: null };
    }
  });
  next();
});


userSchema.methods.hasVotedForRole = function(role) {
  return this.votes[role]?.hasVoted || false;
};


userSchema.methods.getVoteStatus = function(role) {
  return this.votes[role] || { hasVoted: false, votedAt: null, votedFor: null };
};


userSchema.statics.getVotingStats = async function(role) {
  const totalUsers = await this.countDocuments({ isActive: true });
  const votedUsers = await this.countDocuments({
    [`votes.${role}.hasVoted`]: true,
    isActive: true
  });

  const candidateStats = await this.aggregate([
    { $match: { [`votes.${role}.hasVoted`]: true, isActive: true } },
    { $group: { _id: `$votes.${role}.votedFor`, count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  return {
    totalUsers,
    votedUsers,
    votingPercentage: totalUsers > 0 ? ((votedUsers / totalUsers) * 100).toFixed(2) : '0.00',
    candidateStats
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;