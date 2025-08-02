const ErrorLog = require('../models/Errors');

async function logError({ err, req, location }) {
  await ErrorLog.create({
    message: err.message,
    stack: err.stack,
    name: err.name,
    code: err.code || '',
    location,
    route: req.originalUrl,
    method: req.method,
    user: req.user?._id,
    requestBody: req.body,
    queryParams: req.query,
    params: req.params
  });
}

module.exports = logError;