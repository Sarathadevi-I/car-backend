const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Booking = require("../models/adminmodel");
const bcrypt = require("bcryptjs");
// ─── JWT Middleware ───────────────────────────────────────────────
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  // Expect: "Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.admin = decoded;
    next();
  });
};

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    if (username !== process.env.ADMIN_USERNAME) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT — expires in 8 hours
    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── GET /api/admin/bookings ──────────────────────────────────────
// All bookings — newest first
// Optional query: ?source=home or ?source=contact or ?status=pending
router.get("/bookings", verifyToken, async (req, res) => {
  try {
    const filter = {};
    if (req.query.source) filter.source = req.query.source;
    if (req.query.status) filter.status = req.query.status;

    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error("Fetch bookings error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── GET /api/admin/bookings/:id ──────────────────────────────────
router.get("/bookings/:id", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ─── PUT /api/admin/bookings/:id ─────────────────────────────────
// Edit any field — status, name, phone, etc.
router.put("/bookings/:id", verifyToken, async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Booking updated", booking: updated });
  } catch (err) {
    console.error("Update booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── DELETE /api/admin/bookings/:id ──────────────────────────────
router.delete("/bookings/:id", verifyToken, async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.error("Delete booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;