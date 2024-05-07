const express = require("express");
const router = new express.Router();
const Complaint = require("../models/complaintModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Staff = require("../models/staffModel");

const { verifyStaffPassword, verifyToken } = require("../middlewares/auth");

router.get("/", (req, res) => {
  res.status(200).render('partials/staffLogin');
});

router.post("/", verifyStaffPassword, (req, res) => {
  // staff login
  if (!req.staff) {
    // console.log("here in if block")
    req.flash("error", "Invalid UserId or Password.");
    res.redirect("/staff");
  } else if (req.staff.error) {
    req.flash("staffId", req.body.staffId);
    req.flash("error", req.staff.error);
    res.status(500).redirect("/staff");
  } else {
    req.flash("staffId", `${req.staff.staff_id}`);
    req.flash("name", `${req.staff.name.split(" ")[0]}`);
    req.flash("message", `User logged in successfully.`);
    res.redirect("/staff/orders");
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("authorization");
  res.send("Cookie deleted successfully");
});

router.get("/profile", verifyToken, async (req, res) => {
  try {
    const staff = await Staff.findOne({ _id: req._id }, { password: 0 });

    if (!staff) {
      res.status(400).json({ message: "Staff not found." });
      // direct to login page
    } else {
      res.status(200).json(staff);
    }
  } catch (error) {
    res.status(500).json({ message: `Server side error: ${error}` });
  }
});

router.patch("/profile", verifyToken, async (req, res) => {
  try {
    await Staff.findByIdAndUpdate(
      req._id,
      { password: req.body },
      { new: true } // Return the updated document
    );

    res.status(200).json({ message: "Staff password updated successfully." });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ error: `Internal server error ${error}` });
  }
});

router.get("/products", verifyToken, async (req, res) => {
  try {
    const staff = await Staff.findById(req._id);
    if (staff) {
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
    } else {
      res.status(400).json({ error: "Unauthorized." });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/orders", verifyToken, async (req, res) => {
  try {
    const staff = await Staff.findById(req._id);
    if (staff) {
      const { cursor, status } = req.query;
      const limit = 25; // Number of orders per page
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      let query = cursor ? { _id: { $gt: cursor } } : {}; // Create query based on cursor

      // Add additional filters
      query.date = { $gt: startOfDay };
      query.status = status ? { status: status } : { status: "pending" };

      const orders = await Order.find(query)
        .limit(limit)
        .sort({ date: 1 }) // Sort by _id for cursor-based pagination
        .exec();

      // Get the cursor for the next page
      const nextCursor =
        orders.length > 0 ? orders[orders.length - 1]._id : cursor;

      res.json({ orders, nextCursor });
    } else {
      res.status(400).json({ error: "Unauthorized." });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/orders/:id", verifyToken, (req, res) => {
  // update the order status by id
  // use websocket to watch changes in realtime
  res.send("sab changa si");
});

// make it data_stream if perfoming slow
router.get("/tickets", verifyToken, async (req, res) => {
  console.log(`from stafftickets route: ${req._id}`);
  const staff = await Staff.findById(req._id);
  if (staff) {
    Complaint.find()
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
  } else {
    res.status(400).json({ error: "Unauthorized." });
  }
});

router.get("/tickets/:id", verifyToken, async (req, res) => {
  try {
    const staff = await Staff.findById(req._id);

    if (staff) {
      const complaint = await Complaint.findOne({ _id: req.params.id });
      if (!complaint) {
        res.status(400).json({ error: "Ticket not found" });
      } else {
        res.status(200).json(complaint);
      }
    } else {
      res.status(400).json({ error: "Unauthorized." });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch("/tickets/:id", verifyToken, async (req, res) => {
  try {
    const staff = await Staff.findById(req._id);
    if (staff) {
      const updatedComplaint = await Complaint.findOneAndUpdate(
        { _id: req.params.id },
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
    } else {
      res.status(400).json({ error: "Unauthorized." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
