const mongoose = require("mongoose");
const Product= require("../models/productModel")

const orderSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
    set: function(value) {
      return new Date(value); // Convert string to Date object
    }    
  },

  waitingTime:{
    type: Number,
    default: 0
  },

  otp: {
    type: Number,
    min: [100000, "OTP cannot be less than 6 digits."],
    max: [999999, "OTP cannot be more than 6 digits."],
    default: 100000
  },

  grossTotal: {
    type: Number,
    required: [true, "Gross total cannot be empty."],
  },
  discount: {
    type: Number,
    default: 0
  },

  netTotal: {
    type: Number,
    // required: [true, "Net total cannot be empty."],
  },

  products: {
    type: [
      {
        product: {
          type: mongoose.ObjectId,
          ref: "Product"
        },
        quantity: Number,
      },
    ],
    required: true,
  },

  status: {
    status: {
      type: String,
      enum: ["pending", "confirm", "waiting", "ready", "completed", "cancelled"],
      default: "pending",
    },
    role: String,
    by: mongoose.ObjectId,
  },

  payment: {
    status: {
      type: String,
      enum: ["completed", "refund in process", "refund complete"],
      default:"completed"
    },
    orderId:{
      type: String,
      required: true
    },
    paymentId:{
      type: String,
      required: true
    },
    signature:{
      type: String,
      required: true
    }
  },
});

orderSchema.pre('save', function(next) {
  this.netTotal = (Number(this.grossTotal) - Number(this.discount)).toString();
  next();
});

const Order = new mongoose.model("Order", orderSchema);

module.exports = Order;
