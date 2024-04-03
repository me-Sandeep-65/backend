const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Name field cannot be empty."],
  },

  mail: {
    type: String,
    trim: true,
    required: [true, "Email field cannot be empty."],
    unique: [true, "This email is already registered. Try logging in instead."],
  },

  mobile: {
    type: Number,
    required: [true, "Mobile field cannot be empty."],
    min: [1000000000, "Mobile Number cannot be less than 10 digits."],
    max: [9999999999, "Mobile Number cannot be more than 10 digits."],
    unique: [
      true,
      "This mobile is already registered. Try logging in instead.",
    ],
  },

  message: {
    type: String,
    trim: true,
    required: [true, "Message field cannot be empty."],
  },

  action: {
    type: String,
    emum: ["unseen", "pending", "acknowledged"],
    default: "unseen",
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

const Contact = new mongoose.model("contact", contactSchema, "contacts");

module.exports = Contact;
