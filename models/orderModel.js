const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },

  grossTotal: {
    type: Number,
    required: [true, "Gross total cannot be empty."],
  },
  discount: {
    type: Number,
  },

  netTotal: {
    type: Number,
    required: [true, "Net total cannot be empty."],
  },

  products: {
    type: [
      {
        product: mongoose.ObjectId,
        quantity: Number,
      },
    ],
    required: true,
  },

  status: {
    status: {
      type: String,
      enum: ["pending", "waiting", "completed", "cancelled"],
      default: "pending",
    },
    by: mongoose.ObjectId,
  },

  payment: {
    status: {
      type: String,
      enum: ["completed", "refund in process", "refund complete"],
    },
    mode: {
      type: String,
      enum: [
        "debit card",
        "credit card",
        "upi",
        "net banking",
      ],
    },
  },
});

const Order = new mongoose.model("order", orderSchema, "orders");

module.exports = Order;
