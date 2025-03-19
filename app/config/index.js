const config = {
  app: {
    port: process.env.PORT || 3000,
  },
  db: {
    uri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/quanlysach",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "quanlysach-secret-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  },
};

module.exports = config;
