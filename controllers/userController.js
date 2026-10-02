const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SINGLE_ADMIN_EMAIL = "ammu.test@gmail.com";

// ================= REGISTER USER =================

exports.registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Required fields validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        status: false,
        message: "All fields (Name, Email, Phone, Password) are mandatory",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: false,
        message: "Email format should be valid",
      });
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        status: false,
        message: "Phone number must be a valid 10-digit number",
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        status: false,
        message: "Password should contain at least 6 characters",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Assign role
    const assignedRole =
      email.trim().toLowerCase() === SINGLE_ADMIN_EMAIL.toLowerCase()
        ? "admin"
        : "user";

    // Create user
    const user = await User.create({
      name,
      email: email.trim().toLowerCase(),
      phone,
      password: hashedPassword,
      role: assignedRole,
    });

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET || "mysecretkey123",
      {
        expiresIn: "1d",
      }
    );

    return res.status(201).json({
      status: true,
      message: "Registration Successful",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// ================= LOGIN USER =================

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Required fields
    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(400).json({
        status: false,
        message: "User does not exist",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        status: false,
        message: "Invalid password",
      });
    }

    // Determine final role
    const userEmail = user.email.trim().toLowerCase();

    const finalRole =
      userEmail === SINGLE_ADMIN_EMAIL.toLowerCase()
        ? "admin"
        : user.role || "user";

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: finalRole,
      },
      process.env.JWT_SECRET || "mysecretkey123",
      {
        expiresIn: "1d",
      }
    );

    // Login response
    return res.status(200).json({
      status: true,
      message: "Login Successful",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: finalRole,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// ================= UPDATE USER ROLE =================

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    // Validate role
    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({
        status: false,
        message: "Role must be user or admin",
      });
    }

    // Find user
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // Update role
    user.role = role;

    await user.save();

    return res.status(200).json({
      status: true,
      message: "User role updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};