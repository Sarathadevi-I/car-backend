const express = require("express");
const router = express.Router();
const Booking = require("../models/adminmodel");

// POST /api/bookings
// Called from both Homepage form and ContactUs form
router.post("/", async (req, res) => {
  try {
    const {
      name,
      phone,
      carType,
      serviceType,
      pickupLocation,
      dropLocation,
      rentalDate,
      returnDate,
      source, // "home" or "contact"
    } = req.body;

   // Basic validation — name & phone mandatory only for Contact Us form
    if (source === "contact" && (!name || !phone)) {
      return res.status(400).json({ message: "Name and phone are required" });
    }
    if (!source || !["home", "contact"].includes(source)) {
      return res.status(400).json({ message: "Invalid source" });
    }

    const booking = new Booking({
      name,
      phone,
      carType,
      serviceType,
      pickupLocation,
      dropLocation,
      rentalDate,
      returnDate,
      source,
    });

    await booking.save();
    res.status(201).json({ message: "Booking submitted successfully", booking });
  } catch (err) {
    console.error("Booking save error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;