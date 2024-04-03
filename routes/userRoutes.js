const express = require("express");
const router = new express.Router();
const User = require("../models/userModel");
const Contact = require("../models/contactModel");
const Product = require("../models/productModel");
const Order=require("../models/orderModel")
const Complaint = require("../models/complaintModel");

const {
  generateJwt,
  verifyPassword,
  verifyToken,
} = require("../middlewares/auth");

// const uploader= multer({
//     storage:multer.diskStorage({
//         destination: function(req, file, cb){
//             cb(null, "images")
//         },
//         filename: function(req, file, cb){
//             cb(null,file.fieldname+"-"+Date.now()+".png");
//         }
//     })
// }).single("user_file");

router.get("/", (req, res) => {
  res.render("index");
});

router.post("/signup", async (req, res) => {
  try {
    const newUser = new User({
      name: req.body.name,
      age: parseInt(req.body.age),
      mail: req.body.mail,
      mobile: parseInt(req.body.mobile),
      password: req.body.password,
    });

    await newUser.save();
    const token = generateJwt(newUser._id);
    res.cookie("authorization", "Bearer " + token, { httpOnly: true });
    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/login", (req, res) => {
  if (!req.query.signup) {
    res.status(200).json({ message: "hello from login page" });
  } else {
    res.status(200).json({ message: "hello from signup page" });
  }
});

router.post("/login", verifyPassword, (req, res) => {
  // user login
  res.status(200).json(req.user);
});

router.get("/myprofile", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne(
      { _id: req._id },
      { password: 0, cart: 0, tokens: 0, orders: 0 }
    );

    if (!user) {
      res.status(400).json({ message: "User not found." });
      // direct to login page
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    res.status(500).json({ message: `Server side error: ${error}` });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("authorization");
  res.send("Cookie deleted successfully");
});

router.patch("/myprofile", verifyToken, async (req, res) => {
  try {
    const body = req.body;
    await User.findByIdAndUpdate(
      req._id,
      req.body,
      { new: true } // Return the updated document
    );

    res.status(200).json({ message: "User info updated successfully." });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ error: `Internal server error ${error}` });
  }
});

router.get("/products", async (req, res) => {
  try {
    const { cursor, category } = req.query;
    const limit = 25; // Number of products per page

    let query = cursor ? { _id: { $gt: cursor } } : {}; // Create query based on cursor

    // Add additional filters

    // create methods for additional filters
    if (condition) {
      query.category = category;
    }
    // query.status = status ? { status: status } : { status: "pending" };

    const products = await Product.find(query)
      .limit(limit)
      .sort({ _id: 1 }) // Sort by _id for cursor-based pagination
      .exec();

    // Get the cursor for the next page
    const nextCursor =
      products.length > 0 ? products[products.length - 1]._id : cursor;

    res.json({ products, nextCursor });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/mycart", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne(
      { _id: req._id },
      { _id:1, cart: 1}
    );

    if (!user) {
      res.status(400).json({ message: "User not found." });
      // direct to login page
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    res.status(500).json({ message: `Server side error: ${error}` });
  }
});

router.patch("/mycart", verifyToken, async (req, res) => {
  try {
    const updatedCart = await User.findOneAndUpdate(
      { userId: req._id },
      {
        $push: {
          cart: { productId: req.body.pid, quantity: req.body.quantity },
        },
      },
      { new: true } // Return the updated document
    );

    if (!updatedCart) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(updatedCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/myorders", verifyToken, async (req, res) => {
  try {
      const { cursor} = req.query;
      const limit = 15; // Number of products per page

      let query = cursor ? { date: { $gt: cursor } } : {}; // Create query based on cursor
      const orders = await Order.find(query)
        .limit(limit)
        .sort({ date: 1 }) // Sort by _id for cursor-based pagination
        .exec();

      // Get the cursor for the next page
      const nextCursor =
        orders.length > 0 ? orders[orders.length - 1].date : cursor;

      res.json({ orders, nextCursor });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/myorders", verifyToken, (req, res) => {
  res.send("sab changa si");
});

router.get("/support", (req, res) => {
  res.status(200).json({ message: "Hello from help and support page." });
});

router.post("/raise_ticket", verifyToken, (req, res) => {
  const newComplaint = new Complaint({
    orderId: req.body.orderId,
    userId: req._id,
    conversation: [
      {
        body: req.body.message,
        by: req._id,
      },
    ],
  });

  newComplaint
    .save()
    .then((savedComplaint) => {
      // Select only the desired fields to include in the response
      const response = {
        _id: savedComplaint._id,
        status: savedComplaint.status,
        conversation: savedComplaint.conversation.slice(-1)[0], // Include only the last conversation entry
        message: "Complaint registered successfully.",
      };
      res.status(201).json(response);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// make it data_stream if perfoming slow
router.get("/tickets", verifyToken, async (req, res) => {
  // console.log(`from alltickets route: ${req._id}`);
  Complaint.find({ userId: req._id })
    .then((complaints) => {
      // Map over each complaint to extract the desired fields
      const response = complaints.map((complaint) => ({
        _id: complaint._id,
        status: complaint.status,
        conversation: complaint.conversation.slice(-1)[0], // Include only the last conversation entry
      }));
      res.status(201).json(response);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

router.get("/tickets/:id", verifyToken, async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      userId: req._id,
    });
    if (!complaint) {
      res.status(400).json({ error: "Unauthorized." });
    } else {
      res.status(200).json(complaint);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch("/tickets/:id", verifyToken, async (req, res) => {
  try {
    const updatedComplaint = await Complaint.findOneAndUpdate(
      { _id: req.params.id, userId: req._id },
      {
        $push: {
          conversation: { body: req.body.message, by: req._id },
        },
      },
      { new: true } // Return the updated document
    );

    if (!updatedComplaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    res.status(200).json(updatedComplaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/contactus", (req, res) => {
  res.status(200).json({ message: "hello from contact us page" });
});

router.post("/contactus", async (req, res) => {
  try {
    const newContact = new Contact({
      name: req.body.name,
      mail: req.body.mail,
      mobile: parseInt(req.body.mobile),
      message: req.body.message,
    });

    await newContact.save();

    res.status(201).json({ message: "message posted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error at server side." });
  }
});

router.get("/aboutus", (req, res) => {
  res.status(200).json({ message: "hello from about us page." });
});
router.get("/downloads", (req, res) => {
  res.status(200).json({ message: "coming soon." });
});

// router.post('/uploads', uploader,(req, res)=>{
//     res.send('file has been uploaded.');
// });

module.exports = router;
