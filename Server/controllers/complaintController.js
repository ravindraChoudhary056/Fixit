const Complaint = require('../models/Complaint');
const { parsePagination, sendListResponse, applyPagination } = require('../utils/pagination');

// Peer-verification workflow statuses (admin may set these)
const ADMIN_SETTABLE_STATUSES = ['Pending', 'In Progress', 'Pending Verification'];
// Legacy statuses — admin can no longer set Solved directly; existing Solved/Verified records remain valid
const LEGACY_SOLVED_STATUSES = ['Solved', 'Verified'];
const ALL_STATUSES = [...ADMIN_SETTABLE_STATUSES, ...LEGACY_SOLVED_STATUSES];

/**
 * Whether the logged-in student may verify/cancel a complaint in the verification queue.
 * Public: any student. Private: only the original owner.
 */
const canStudentActOnVerification = (complaint, user) => {
  if (complaint.complaintType === 'Public') return true;
  return complaint.student.toString() === user._id.toString();
};

/**
 * Whether the logged-in student may cancel an already-Solved complaint.
 * Private self-verify: owner only. Public: the student whose ID is stored in verifiedBy.
 */
const canStudentCancelSolved = (complaint, user) => {
  if (complaint.complaintType === 'Private') {
    return complaint.student.toString() === user._id.toString();
  }
  if (!complaint.verifiedBy) return false;
  return complaint.verifiedBy.includes(user._id.toString());
};

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Logged in students only)
exports.createComplaint = async (req, res) => {
  try {
    const {
      complaintType, locationType, locationName, floor, 
      roomNumber, category, priority, title, 
      description, additionalInstruction
    } = req.body;

    // Build the complaint object
    const complaintData = {
      student: req.user._id, // Comes from authMiddleware
      complaintType,
      locationType,
      locationName,
      floor,
      category,
      priority,
      title,
      description
    };

    // Add optional fields if they exist
    if (roomNumber && complaintType === 'Private') complaintData.roomNumber = roomNumber;
    if (additionalInstruction && complaintType === 'Private') complaintData.additionalInstruction = additionalInstruction;
    
    // Add image path if file was uploaded
    if (req.file) {
      complaintData.image = `/uploads/${req.file.filename}`;
    }

    const complaint = await Complaint.create(complaintData);

    res.status(201).json({
      message: 'Complaint registered successfully',
      complaint
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all public complaints (active only — excludes Solved/Verified)
// @route   GET /api/complaints/public
// @access  Private
exports.getPublicComplaints = async (req, res) => {
  try {
    const pagination = parsePagination(req);
    const filter = {
      complaintType: 'Public',
      status: { $nin: ['Solved', 'Verified', 'Pending Verification'] },
    };

    // Optimized query with pagination — count + page fetched in parallel
    const [total, complaints] = await Promise.all([
      Complaint.countDocuments(filter),
      applyPagination(
        Complaint.find(filter)
          .populate('student', 'fullName email')
          .sort({ createdAt: -1 }),
        pagination
      ).lean(),
    ]);

    return sendListResponse(res, complaints, total, pagination);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get solved public complaints for the dedicated Solved Complaints view
// @route   GET /api/complaints/public/solved
// @access  Private
exports.getSolvedPublicComplaints = async (req, res) => {
  try {
    const pagination = parsePagination(req);
    const filter = {
      complaintType: 'Public',
      status: { $in: ['Solved', 'Verified'] },
    };

    const [total, complaints] = await Promise.all([
      Complaint.countDocuments(filter),
      applyPagination(
        Complaint.find(filter)
          .populate('student', 'fullName email')
          .sort({ updatedAt: -1 }),
        pagination
      ).lean(),
    ]);

    return sendListResponse(res, complaints, total, pagination);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle Upvote on a complaint
// @route   PUT /api/complaints/:id/upvote
// @access  Private
exports.upvoteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    // Check if user already upvoted
    const hasUpvoted = complaint.upvotes.includes(req.user._id);

    if (hasUpvoted) {
      // Remove upvote
      complaint.upvotes = complaint.upvotes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      // Add upvote
      complaint.upvotes.push(req.user._id);
    }

    await complaint.save();
    res.status(200).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user's private complaints only
// @route   GET /api/complaints/me
// @access  Private
exports.getMyComplaints = async (req, res) => {
  try {
    const pagination = parsePagination(req);
    const filter = {
      student: req.user._id,
      complaintType: 'Private',
    };

    const [total, complaints] = await Promise.all([
      Complaint.countDocuments(filter),
      applyPagination(
        Complaint.find(filter)
          .populate('student', 'fullName email')
          .sort({ createdAt: -1 }),
        pagination
      ).lean(),
    ]);

    return sendListResponse(res, complaints, total, pagination);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get aggregate stats for the admin dashboard
// @route   GET /api/complaints/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    // Optimized aggregation — avoids loading every document into memory
    const [statusCounts, totalResult] = await Promise.all([
      Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Complaint.countDocuments({}),
    ]);

    const countByStatus = statusCounts.reduce((acc, row) => {
      acc[row._id] = row.count;
      return acc;
    }, {});

    const stats = {
      total: totalResult,
      pending: countByStatus['Pending'] || 0,
      inProgress: countByStatus['In Progress'] || 0,
      pendingVerification: countByStatus['Pending Verification'] || 0,
      solved: LEGACY_SOLVED_STATUSES.reduce((sum, s) => sum + (countByStatus[s] || 0), 0),
    };

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all system records filtered by type constraints
// @route   GET /api/complaints/admin/all
// @access  Private/Admin
exports.getAllSystemComplaints = async (req, res) => {
  try {
    const pagination = parsePagination(req);
    const filter = {};

    // Optional server-side filters — reduces payload for admin table views
    if (req.query.status && req.query.status !== 'All') {
      filter.status = req.query.status;
    }
    if (req.query.type && req.query.type !== 'All') {
      filter.complaintType = req.query.type;
    }

    let sort = { createdAt: -1 };
    if (req.query.sortBy === 'priority') {
      sort = { priority: req.query.sortOrder === 'asc' ? 1 : -1 };
    } else if (req.query.sortBy === 'votes') {
      sort = { upvotes: req.query.sortOrder === 'asc' ? 1 : -1 };
    } else if (req.query.sortOrder === 'asc') {
      sort = { createdAt: 1 };
    }

    const [total, complaints] = await Promise.all([
      Complaint.countDocuments(filter),
      applyPagination(
        Complaint.find(filter)
          .populate('student', 'fullName email')
          .sort(sort),
        pagination
      ).lean(),
    ]);

    return sendListResponse(res, complaints, total, pagination);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update complaint status (admin only)
// @route   PUT /api/complaints/admin/:id/status
// @access  Private/Admin
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Why: Reject invalid payloads before touching the database
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    if (!ALL_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed values: ${ALL_STATUSES.join(', ')}` });
    }

    // Peer-verification: admin marks work done as "Pending Verification", not "Solved"
    if (status === 'Solved') {
      return res.status(400).json({
        message: 'Admin cannot mark complaints as Solved. Use "Pending Verification" and let a student verify the fix.',
      });
    }

    // Deprecated direct path — redirect admins to the new workflow
    if (status === 'Verified') {
      return res.status(400).json({
        message: '"Verified" is deprecated. Use "Pending Verification" instead.',
      });
    }

    if (!ADMIN_SETTABLE_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Admin may only set: ${ADMIN_SETTABLE_STATUSES.join(', ')}` });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.status = status;
    // Clear verifier when admin moves complaint back into the active pipeline
    if (status !== 'Pending Verification') {
      complaint.verifiedBy = null;
    }

    await complaint.save();

    // How: Return populated complaint so the admin table can refresh without a second fetch
    const updated = await Complaint.findById(complaint._id).populate('student', 'fullName email');

    res.status(200).json({ message: `Status updated to ${status}`, complaint: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get complaints awaiting peer verification (Public + Private)
// @route   GET /api/complaints/verification-queue
// @access  Private (students)
exports.getVerificationQueue = async (req, res) => {
  try {
    const pagination = parsePagination(req);
    const filter = { status: 'Pending Verification' };

    const [total, complaints] = await Promise.all([
      Complaint.countDocuments(filter),
      applyPagination(
        Complaint.find(filter)
          .populate('student', 'fullName email')
          .sort({ updatedAt: -1 }),
        pagination
      ).lean(),
    ]);

    return sendListResponse(res, complaints, total, pagination);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Student verifies a fix — moves complaint from Pending Verification to Solved
// @route   PUT /api/complaints/:id/verify
// @access  Private (students)
exports.verifyComplaint = async (req, res) => {
  try {
    if (req.user.role === 'Admin') {
      return res.status(403).json({ message: 'Only students can verify complaints' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.status !== 'Pending Verification') {
      return res.status(400).json({ message: 'Only complaints awaiting verification can be verified' });
    }

    if (!canStudentActOnVerification(complaint, req.user)) {
      return res.status(403).json({ message: 'You are not allowed to verify this private complaint' });
    }

    // Private owner self-verify displays as "Self"; public shows peer name + ID
    const isPrivateOwner =
      complaint.complaintType === 'Private' &&
      complaint.student.toString() === req.user._id.toString();

    complaint.verifiedBy = isPrivateOwner
      ? 'Self'
      : `${req.user.fullName} (${req.user._id})`;
    complaint.status = 'Solved';

    await complaint.save();

    const updated = await Complaint.findById(complaint._id).populate('student', 'fullName email');
    res.status(200).json({ message: 'Complaint verified and marked as Solved', complaint: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel verification — reverts status to Pending (from Pending Verification or Solved)
// @route   PUT /api/complaints/:id/cancel-verification
// @access  Private (students)
exports.cancelVerification = async (req, res) => {
  try {
    if (req.user.role === 'Admin') {
      return res.status(403).json({ message: 'Only students can cancel verification' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.status === 'Pending Verification') {
      if (!canStudentActOnVerification(complaint, req.user)) {
        return res.status(403).json({ message: 'You are not allowed to cancel verification for this complaint' });
      }
    } else if (complaint.status === 'Solved') {
      if (!canStudentCancelSolved(complaint, req.user)) {
        return res.status(403).json({ message: 'You are not allowed to cancel this verification' });
      }
    } else {
      return res.status(400).json({ message: 'This complaint is not in a verifiable state' });
    }

    complaint.status = 'Pending';
    complaint.verifiedBy = null;
    await complaint.save();

    const updated = await Complaint.findById(complaint._id).populate('student', 'fullName email');
    res.status(200).json({ message: 'Verification cancelled — complaint returned to Pending', complaint: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get complaint stats for the logged-in student's dashboard
// @route   GET /api/complaints/my-stats
// @access  Private
exports.getMyStats = async (req, res) => {
  try {
    // Optimized aggregation scoped to the logged-in student
    const statusCounts = await Complaint.aggregate([
      { $match: { student: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const countByStatus = statusCounts.reduce((acc, row) => {
      acc[row._id] = row.count;
      return acc;
    }, {});

    const total = Object.values(countByStatus).reduce((sum, n) => sum + n, 0);

    const stats = {
      total,
      pending: countByStatus['Pending'] || 0,
      inProgress: countByStatus['In Progress'] || 0,
      pendingVerification: countByStatus['Pending Verification'] || 0,
      solved: LEGACY_SOLVED_STATUSES.reduce((sum, s) => sum + (countByStatus[s] || 0), 0),
    };

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
