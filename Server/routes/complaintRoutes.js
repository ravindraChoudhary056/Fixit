const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getPublicComplaints,
  getSolvedPublicComplaints,
  upvoteComplaint,
  getMyComplaints,
  getAllSystemComplaints,
  getAdminStats,
  updateComplaintStatus,
  getMyStats,
  getVerificationQueue,
  verifyComplaint,
  cancelVerification,
} = require('../controllers/complaintController');
const { protect, admin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Route to create a complaint
// protect: checks login token
// upload.single('image'): looks for a file field named "image"

// Student Interfaces Operations Endpoints
router.post('/', protect, upload.single('image'), createComplaint);
router.get('/public', protect, getPublicComplaints);
router.get('/public/solved', protect, getSolvedPublicComplaints);
router.put('/:id/upvote', protect, upvoteComplaint);
router.get('/me', protect, getMyComplaints);
router.get('/my-stats', protect, getMyStats);

// Peer-verification workflow — students confirm admin fixes
router.get('/verification-queue', protect, getVerificationQueue);
router.put('/:id/verify', protect, verifyComplaint);
router.put('/:id/cancel-verification', protect, cancelVerification);

// Admin Control Framework Operations Endpoints
router.get('/admin/stats', protect, admin, getAdminStats);
router.get('/admin/all', protect, admin, getAllSystemComplaints);
router.put('/admin/:id/status', protect, admin, updateComplaintStatus);

module.exports = router;
