const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    complaintType: {
      type: String,
      enum: ['Public', 'Private'],
      required: true,
    },
    locationType: {
      type: String,
      enum: ['Hostel', 'Academic Building'],
      required: true,
    },
    locationName: {
      type: String,
      required: true,
      // Validation can be handled in frontend/controller for specific names like BH1, CC1 etc.
    },
    floor: {
      type: String,
      enum: ['Ground Floor', 'First Floor', 'Second Floor', 'Third Floor', 'Fourth Floor'],
      required: true,
    },
    roomNumber: {
      type: String, // Optional, only for Private
    },
    category: {
      type: String,
      enum: ['Electricity', 'Water', 'Cleaning', 'Furniture', 'Internet', 'Plumbing', 'Other'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    additionalInstruction: {
      type: String, // Optional, only for Private
    },
    image: {
      type: String, // URL/Path to image
    },
    status: {
      type: String,
      // 'Verified' is deprecated — kept so existing records are not broken
      enum: ['Pending', 'In Progress', 'Pending Verification', 'Solved', 'Verified'],
      default: 'Pending',
    },
    // Peer-verification: set when a student confirms the fix (name/ID or "Self" for private owner)
    verifiedBy: {
      type: String,
      default: null,
    },

    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Optimized query indexes — student + status are the most common filter keys
complaintSchema.index({ student: 1, complaintType: 1 });
complaintSchema.index({ status: 1, complaintType: 1 });
complaintSchema.index({ status: 1, updatedAt: -1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);