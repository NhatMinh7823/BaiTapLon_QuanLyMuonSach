const jwt = require("jsonwebtoken");
const config = require("../config");
const ApiError = require("../api-error");

const verifyToken = (req, res, next) => {
  const token =
    req.headers["x-access-token"] || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new ApiError(403, "No token provided"));
  }

  jwt.verify(token, config.jwt.secret, (err, decoded) => {
    if (err) {
      return next(new ApiError(401, "Unauthorized!"));
    }

    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.userRole !== "admin") {
    return next(new ApiError(403, "Require Admin Role!"));
  }
  next();
};

const authJwt = {
  verifyToken,
  isAdmin,
};

module.exports = authJwt;
