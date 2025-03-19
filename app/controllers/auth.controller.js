const DocGiaService = require("../models/docgia.model");
const NhanVienService = require("../models/nhanvien.model");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");

exports.register = async (req, res, next) => {
  try {
    if (!req.body.email || !req.body.password) {
      return next(new ApiError(400, "Email and password are required"));
    }

    const docGiaService = new DocGiaService(MongoDB.client);

    // Check if user already exists
    const existingUser = await docGiaService.findByEmail(req.body.email);
    if (existingUser) {
      return next(new ApiError(400, "Email already in use"));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create new user
    const userData = {
      ...req.body,
      password: hashedPassword,
      role: "user",
    };

    const user = await docGiaService.create(userData);

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return res.status(201).send(userWithoutPassword);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while registering the user")
    );
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password, isAdmin } = req.body;

    if (!email || !password) {
      return next(new ApiError(400, "Email and password are required"));
    }

    let user;

    if (isAdmin) {
      // Admin login
      const nhanVienService = new NhanVienService(MongoDB.client);
      user = await nhanVienService.findByEmail(email);
    } else {
      // User login
      const docGiaService = new DocGiaService(MongoDB.client);
      user = await docGiaService.findByEmail(email);
    }

    if (!user) {
      return next(new ApiError(401, "Invalid credentials"));
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new ApiError(401, "Invalid credentials"));
    }

    // Thêm role vào đối tượng user
    user.role = isAdmin ? "admin" : "user";

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: isAdmin ? "admin" : "user" },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Return user without password
    const { password: pwd, ...userWithoutPassword } = user;
    return res.status(200).send({
      ...userWithoutPassword,
      accessToken: token,
    });
  } catch (error) {
    return next(new ApiError(500, "An error occurred while logging in"));
  }
};