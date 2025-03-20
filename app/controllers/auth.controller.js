const DocGiaService = require("../models/docgia.model");
const NhanVienService = require("../models/nhanvien.model");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");

exports.register = async (req, res, next) => {
  try {
    console.log("Register request data:", JSON.stringify(req.body, null, 2));

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
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(req.body.password, 10);
    } catch (hashError) {
      console.error("Error hashing password:", hashError);
      return next(new ApiError(500, "Error processing password"));
    }

    // Create new user with appropriate format
    const userData = {
      hoLot: req.body.hoLot || "",
      ten: req.body.ten || "",
      email: req.body.email,
      password: hashedPassword,
      ngaySinh: req.body.ngaySinh ? new Date(req.body.ngaySinh) : null,
      phai: req.body.phai || "Nam",
      diaChi: req.body.diaChi || "",
      dienThoai: req.body.dienThoai || "",
      role: "user",
    };

    console.log("Processed user data:", JSON.stringify(userData, null, 2));

    // Save user to database
    let user;
    try {
      user = await docGiaService.create(userData);
      console.log("User created in database:", JSON.stringify(user, null, 2));
    } catch (dbError) {
      console.error("Error creating user in database:", dbError);
      return next(new ApiError(500, "Error saving user to database"));
    }

    // Prepare response - handling potential issues
    try {
      // Ensure user object is as expected
      if (!user || typeof user !== "object") {
        console.error("Invalid user object returned:", user);
        return next(
          new ApiError(500, "Invalid user data returned from database")
        );
      }

      // Create a safe copy without sensitive data
      const safeUser = { ...user };

      // Remove password if exists
      if (safeUser.password) {
        delete safeUser.password;
      }

      // Send safe response
      return res.status(201).send(safeUser);
    } catch (responseError) {
      console.error("Error preparing response:", responseError);
      return next(new ApiError(500, "Error preparing user response"));
    }
  } catch (error) {
    console.error("Unhandled error in register controller:", error);
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