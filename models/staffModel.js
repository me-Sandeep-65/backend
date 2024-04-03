const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Name field cannot be empty."],
  },

  age: Number,

  staff_id:{
    type: String,
    trim: true,
    required: [true, "Staff ID field cannot be empty."],
    unique: [true, "This Staff ID is already registered. Try logging in instead."],
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

  identity:{
    type: String,
    trim: true,
    required: [true, "Identity field cannot be empty."],
    unique: [true, "This Identity is already registered. Try logging in instead."],    
  },

  identityno:{
    type: String,
    trim: true,
    required: [true, "Identity No. field cannot be empty."],
    unique: [true, "This Identity No. is already registered. Try logging in instead."],
  },

  address:{
    type: String,
    trim: true,
    required: [true, "address field cannot be empty."],
    unique: [true, "This address is already registered. Try logging in instead."],
  },

  pincode:{
    type: Number,
    required: [true, "Mobile field cannot be empty."],
    min: [100000, "Mobile Number cannot be less than 6 digits."],
    max: [999999, "Mobile Number cannot be more than 6 digits."],
  },

  password: String,

  addedby:{
    type: mongoose.ObjectId,
    required: true
  }

});

// middleware to hash the password before saving it to database
staffSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const Staff = new mongoose.model("Staff", staffSchema, "staffs");

module.exports = Staff;
