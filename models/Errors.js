const mongoose = require('mongoose');

const errorLogSchema = new mongoose.Schema({
  message: String,
  stack: String,
  name: String,
  timestamp: { type: Date, default: Date.now },
  location: String,
  route: String,
  method: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requestBody: mongoose.Schema.Types.Mixed,
  queryParams: mongoose.Schema.Types.Mixed,
  params: mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model('ErrorLog', errorLogSchema);