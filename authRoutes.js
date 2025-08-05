const express = require("express");
const bcrypt = require("bcrypt");
const db = require("./db");
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
    const sql = "INSERT INTO parents (email, password) VALUES (?, ?)";
    db.query(sql, [email, hashedPassword], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY")
          return res.status(409).json({ error: "Email already exists." });
        return res.status(500).json({ error: "Database error" });
      }
      res.status(201).json({ message: "Parent registered successfully" });
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ======================
// 🔐 Parent Login
// ======================
router.post("/parent/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required." });

  const sql = "SELECT * FROM parents WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0)
      return res.status(404).json({ error: "User not found" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ error: "Incorrect password" });

    res.status(200).json({
      message: "Parent logged in successfully",
      user: { id: user.id, email: user.email }
    });
  });
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
    const sql = "INSERT INTO teachers (email, password) VALUES (?, ?)";
    db.query(sql, [email, hashedPassword], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY")
          return res.status(409).json({ error: "Email already exists." });
        return res.status(500).json({ error: "Database error" });
      }
      res.status(201).json({ message: "Teacher registered successfully" });
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ======================
// 🔐 Teacher Login
// ======================
router.post("/teacher/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required." });

  const sql = "SELECT * FROM teachers WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0)
      return res.status(404).json({ error: "User not found" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ error: "Incorrect password" });

    res.status(200).json({
      message: "Teacher logged in successfully",
      user: { id: user.id, email: user.email }
    });
  });
});

module.exports = router;
