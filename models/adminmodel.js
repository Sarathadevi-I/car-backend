const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    carType: { type: String, trim: true },
    serviceType: { type: String, trim: true }, // only from Contact Us form
    pickupLocation: { type: String, trim: true },
    dropLocation: { type: String, trim: true },
    rentalDate: { type: String, trim: true },
    returnDate: { type: String, trim: true },
    source: {
      type: String,
      enum: ["home", "contact"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);