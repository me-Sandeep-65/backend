const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Name field cannot be empty."],
  },

  age: Number,

  admin_id:{
    type: String,
    trim: true,
    required: [true, "Admin ID field cannot be empty."],
    unique: [true, "This Admin ID is already registered. Try logging in instead."],
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

  password: String,

});

// middleware to hash the password before saving it to database
adminSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const Admin = new mongoose.model("Admin", adminSchema, "admins");

module.exports = Admin;
