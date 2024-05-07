const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  image: {
    type: String,
    trim: true,
    default: "order.png",
  },

  name: {
    type: String,
    trim: true,
    required: [true, "Name field cannot be empty."],
  },

  price: {
    type: Number,
    required: [true, "Price field field cannot be empty."],
  },

  type: {
    type: String,
    trim: true,
    required: [true, "Type field cannot be empty."],
  },
  category: {
    type: String,
    trim: true,
    required: [true, "Category field cannot be empty."],
  },
  tag: {
    type: [
      {
        type: String, // validate this while testing
        trim: true,
      },
    ],
    default: [],
  },

  description: {
    type: String,
    trim: true,
    required: [true, "Descreption field cannot be empty."],
  },

  reviews: {
    type: [
      {
        userId: mongoose.ObjectId,
        date: {
          type: Date,
          default: Date.now,
        },
        rating: mongoose.Decimal128,
        message: {
          type: String,
          trim: true,
          required: [true, "Message cannot be empty."],
        },
      },
    ],
    default: [],
  },
});

const Product = new mongoose.model("Product", productSchema);

module.exports = Product;
