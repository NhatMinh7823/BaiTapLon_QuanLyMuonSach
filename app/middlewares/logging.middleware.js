// Middleware to log requests
const requestLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  if (Object.keys(req.query).length > 0) {
    console.log(`Query params:`, req.query);
  }

  if (["POST", "PUT"].includes(req.method) && req.body) {
    console.log(`Request body:`, JSON.stringify(req.body, null, 2));
  }

  next();
};

module.exports = requestLogger;
