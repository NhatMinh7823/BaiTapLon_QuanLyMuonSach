const express = require("express");
const cors = require("cors");
const path = require("path");
const ApiError = require("./app/api-error");

// Import routes
const authRouter = require("./app/routes/auth.route");
const sachRouter = require("./app/routes/sach.route");
const nhaxuatbanRouter = require("./app/routes/nhaxuatban.route");
const theodoimuonsachRouter = require("./app/routes/theodoimuonsach.route");
const docgiaRouter = require("./app/routes/docgia.route");
const nhanvienRouter = require("./app/routes/nhanvien.route");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Register routes
app.use("/api/auth", authRouter);
app.use("/api/sach", sachRouter);
app.use("/api/nhaxuatban", nhaxuatbanRouter);
app.use("/api/theodoimuonsach", theodoimuonsachRouter);
app.use("/api/docgia", docgiaRouter);
app.use("/api/nhanvien", nhanvienRouter);

// Handle 404 routes
app.use((req, res, next) => {
  return next(new ApiError(404, "Resource not found"));
});

// Handle errors
app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the book lending system API." });
});

module.exports = app;
