const mongoose = require('mongoose');

const AdminInviteSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  invitedBy: { type: String }, // Kis admin ne invite kiya
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdminInvite', AdminInviteSchema);