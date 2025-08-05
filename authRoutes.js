const express = require("express");
const bcrypt = require("bcrypt");
const { Parent, Teacher } = require("./db");
const router = express.Router();

// ======================
// 👨‍👩‍👧 Parent Signup
// ======================
router.post("/parent/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required." });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const parent = new Parent({
      email,
      password: hashedPassword
    });
    
    await parent.save();
    res.status(201).json({ message: "Parent registered successfully" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Email already exists." });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// ======================
// 🔐 Parent Login
// ======================
router.post("/parent/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required." });

  try {
    const user = await Parent.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    res.status(200).json({
      message: "Parent logged in successfully",
      user: { id: user._id, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// ======================
// 🧑‍🏫 Teacher Signup
// ======================
router.post("/teacher/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required." });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const teacher = new Teacher({
      email,
      password: hashedPassword
    });
    
    await teacher.save();
    res.status(201).json({ message: "Teacher registered successfully" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Email already exists." });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// ======================
// 🔐 Teacher Login
// ======================
router.post("/teacher/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required." });

  try {
    const user = await Teacher.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    res.status(200).json({
      message: "Teacher logged in successfully",
      user: { id: user._id, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
