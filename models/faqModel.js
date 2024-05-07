const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    trim: true,
    required: [true, "Question field cannot be empty."],
    unique: [true, "This Question already exists."],
  },

  answer: {
    type: String,
    trim: true,
    required: [true, "Answer field cannot be empty."],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Faq = new mongoose.model("faq", faqSchema);

module.exports = Faq;
