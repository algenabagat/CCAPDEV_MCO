const mongoose = require('mongoose');

const errorLogSchema = new mongoose.Schema({
  message: String,
  stack: String,
  name: String,
  code: String, // optional
  timestamp: { type: Date, default: Date.now },
  location: String,
  route: String, // optional
  method: String, // optional
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional
  requestBody: mongoose.Schema.Types.Mixed, // optional
  queryParams: mongoose.Schema.Types.Mixed, // optional
  params: mongoose.Schema.Types.Mixed // optional
});

module.exports = mongoose.model('ErrorLog', errorLogSchema);