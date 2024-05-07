const mongoose = require("mongoose");
const User = require("./userModel")
const Order = require("./orderModel")

const complaintSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.ObjectId,
    required: [true, "Order ID field cannot be empty."],
    ref: "Order"
  },

  userId: {
    type: mongoose.ObjectId,
    required: [true, "User ID field cannot be empty."],
    ref: "User"
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
        role: String,
        date:{
          type:Date,
          default:Date.now
        },
      },
    ],
  },
});

const Complaint = new mongoose.model("complaint", complaintSchema);

module.exports = Complaint;
