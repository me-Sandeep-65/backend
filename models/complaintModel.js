const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.ObjectId,
    required: [true, "Order ID field cannot be empty."],
  },

  userId: {
    type: mongoose.ObjectId,
    required: [true, "User ID field cannot be empty."],
  },

  status: {
    type: String,
    emum: ["pending", "resolved"],
    default: "pending",
  },

  conversation: {
    type: [
      {
        body: {
          type: String,
          trim: true,
          required: true,
          minLength: [50, "Elaborate your concern in atleast 15 - 20 words."],
        },
        by: mongoose.ObjectId,
        date:{
          type:Date,
          default:Date.now
        },
      },
    ],
  },
});

const Complaint = new mongoose.model("complaint", complaintSchema, "complaints");

module.exports = Complaint;
