const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Access denied" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.userEmail = decoded.Email;
    next();
  });
};

const candidatesList = {
  president: ['John Doe', 'Jane Smith', 'Robert Lee'],
  vicePresident: ['Alice Cooper', 'Mark Taylor'],
  secretary: ['Sara White', 'David Kim'],
  treasury: ['Emma Johnson', 'Chris Evans']
};

const validRoles = ['president', 'vicePresident', 'secretary', 'treasury'];


router.post('/register', async (req, res) => {
  const { Email, Password } = req.body;
  
  if (!Email || !Password) {
    return res.status(400).json({ message: "Email and Password are required" });
  }

  try {
    
    const existingUser = await User.findOne({ Email: Email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    
    const hashedPassword = await bcrypt.hash(Password, 12); 
    
    
    const newUser = new User({ 
      Email: Email.toLowerCase(), 
      Password: hashedPassword 
    });
    
    await newUser.save();

    
    const token = jwt.sign({ Email: newUser.Email }, JWT_SECRET, { expiresIn: '1d' });
    
    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: { Email: newUser.Email, role: newUser.role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


router.post('/login', async (req, res) => {
  const { Email, Password } = req.body;
  
  if (!Email || !Password) {
    return res.status(400).json({ message: "Email and Password are required" });
  }

  try {
    
    const user = await User.findOne({ Email: Email.toLowerCase() });
    if (!user || !user.isActive) {
      return res.status(404).json({ message: "User not found or inactive" });
    }

   
    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

   
    const token = jwt.sign({ Email: user.Email }, JWT_SECRET, { expiresIn: '1d' });
    
    return res.status(200).json({
      message: "Login successful",
      token,
      user: { Email: user.Email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


router.post('/vote/:role', verifyToken, async (req, res) => {
  const role = req.params.role;
  const { candidate } = req.body;

  
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }
  
 
  if (!candidate) {
    return res.status(400).json({ message: "Candidate is required" });
  }
  
  if (!candidatesList[role].includes(candidate)) {
    return res.status(400).json({ message: `Candidate not valid for ${role}` });
  }

  try {
    
    const user = await User.findOne({ Email: req.userEmail, isActive: true });
    if (!user) {
      return res.status(404).json({ message: "User not found or inactive" });
    }

    
    if (user.hasVotedForRole(role)) {
      return res.status(400).json({ message: `You have already voted for ${role}` });
    }

 
    const updateResult = await User.updateOne(
      { 
        Email: req.userEmail, 
        isActive: true,
        [`votes.${role}.hasVoted`]: { $ne: true } 
      },
      {
        $set: {
          [`votes.${role}.hasVoted`]: true,
          [`votes.${role}.votedAt`]: new Date(),
          [`votes.${role}.votedFor`]: candidate
        }
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(400).json({ message: `Unable to record vote. You may have already voted for ${role}` });
    }

    return res.status(200).json({
      message: `Vote recorded successfully for ${role}`,
      votedFor: candidate,
      votedAt: new Date()
    });
  } catch (error) {
    console.error('Vote error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


router.get('/user-status/:role', verifyToken, async (req, res) => {
  const role = req.params.role;

  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const user = await User.findOne({ Email: req.userEmail, isActive: true });
    if (!user) {
      return res.status(404).json({ message: "User not found or inactive" });
    }

    const status = user.getVoteStatus(role);

    return res.status(200).json({
      Email: user.Email,
      role,
      hasVoted: status.hasVoted,
      votedAt: status.votedAt,
      votedFor: status.votedFor
    });
  } catch (error) {
    console.error('User status error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


router.get('/candidates', (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      candidates: candidatesList
    });
  } catch (error) {
    console.error('Candidates error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


router.get('/stats/:role', async (req, res) => {
  const role = req.params.role;

  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
  
    const stats = await User.getVotingStats(role);
    
    
    const allCandidates = candidatesList[role];
    const statsMap = stats.candidateStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    const completeStats = allCandidates.map(candidate => ({
      _id: candidate,
      name: candidate,
      count: statsMap[candidate] || 0,
      percentage: stats.votedUsers > 0 ? (((statsMap[candidate] || 0) / stats.votedUsers) * 100).toFixed(1) : 0
    }));

    res.status(200).json({
      role,
      totalUsers: stats.totalUsers,
      votedUsers: stats.votedUsers,
      votingPercentage: stats.votingPercentage,
      candidateStats: completeStats,
      candidates: allCandidates
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.get('/stats', async (req, res) => {
  try {
    const allStats = {};
    
    
    const totalUsers = await User.countDocuments({ isActive: true });
    
    const rolePromises = validRoles.map(async (role) => {
      const stats = await User.getVotingStats(role);
      
     
      const allCandidates = candidatesList[role];
      const statsMap = stats.candidateStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {});

      const completeStats = allCandidates.map(candidate => ({
        _id: candidate,
        name: candidate,
        count: statsMap[candidate] || 0,
        percentage: stats.votedUsers > 0 ? (((statsMap[candidate] || 0) / stats.votedUsers) * 100).toFixed(1) : 0
      }));

      return {
        role,
        data: {
          role,
          totalUsers: stats.totalUsers,
          votedUsers: stats.votedUsers,
          votingPercentage: stats.votingPercentage,
          candidateStats: completeStats,
          candidates: allCandidates
        }
      };
    });

    const roleResults = await Promise.all(rolePromises);
    

    roleResults.forEach(({ role, data }) => {
      allStats[role] = data;
    });

   
    const overallVotedUsers = await User.countDocuments({ 
      $or: validRoles.map(role => ({ [`votes.${role}.hasVoted`]: true })),
      isActive: true 
    });

    res.status(200).json({
      success: true,
      overall: {
        totalUsers,
        votedUsers: overallVotedUsers,
        votingPercentage: totalUsers > 0 ? ((overallVotedUsers / totalUsers) * 100).toFixed(2) : 0
      },
      roleStats: allStats
    });
  } catch (error) {
    console.error('All stats error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;