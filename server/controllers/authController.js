import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

//    Register new user
// @route   POST /api/auth/signup
export const signup = async (req, res) => {
  try {
    const { name, email, password, university, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const user = await User.create({ name, email, password, university, department });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      university: user.university,
      department: user.department,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      university: user.university,
      department: user.department,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get logged-in user info
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  res.json(req.user);
};