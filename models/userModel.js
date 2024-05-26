const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Order = require("../models/orderModel")

const userSchema = new mongoose.Schema({
  image: {
    type: String,
    trim: true,
    default: "profile.png",
  },

  name: {
    type: String,
    trim: true,
    required: [true, "Name field cannot be empty."],
  },

  age: Number,

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

  password: String,

  cart: {
    type: [
      {
        product: mongoose.ObjectId,
        quantity: Number,
      },
    ],
    default: [],
  },

  orders: {
    type: [mongoose.ObjectId],
    default: [],
    ref: "Order"
  },

  tokens: {
    type: [String],
    default: [],
  },
});

// middleware to hash the password before saving it to database
userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = new mongoose.model("User", userSchema, "users");

module.exports = User;
