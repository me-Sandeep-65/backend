const express = require("express");
const router = new express.Router();
const Admin = require("../models/adminModel");
const Complaint = require("../models/complaintModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const Staff = require("../models/staffModel");

const { verifyAdminPassword, verifyToken } = require("../middlewares/auth");

router.get("/admin", (req, res) => {
  res.status(200).json({ message: "hello admin" });
});

router.post("/admin", verifyAdminPassword, (req, res) => {
  // admin login
  res.status(200).json(req.admin);
});

router.get("/logout", (req, res) => {
  res.clearCookie("authorization");
  res.send("Cookie deleted successfully");
});

router.get("/admin/profile", verifyToken, async (req, res) => {
  try {
    const admin = await Admin.findOne({ _id: req._id }, { password: 0 });

    if (!admin) {
      res.status(400).json({ message: "Admin not found." });
      // direct to login page
    } else {
      res.status(200).json(admin);
    }
  } catch (error) {
    res.status(500).json({ message: `Server side error: ${error}` });
  }
});

router.patch("/admin/profile", verifyToken, async (req, res) => {
  try {
    await Admin.findByIdAndUpdate(
      req._id,
      { password: req.body },
      { new: true } // Return the updated document
    );

    res.status(200).json({ message: "Admin password updated successfully." });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ error: `Internal server error ${error}` });
  }
});

router.get("/admin/create_admin", verifyToken, async (req, res) => {
  try {
    const admin = await Admin.findById(req._id);
    if (admin) {
      res.status(200).json({ message: "hello from create admin page." });
    } else {
      res.status(400).json({ error: "Unauthorized." });
    }
  } catch (error) {
    res.status(500).json({ error: `Server Error: ${error}` });
  }
});

router.post("/admin/create_admin", verifyToken, async (req, res) => {
  try {
    const admin = await Admin.findById(req._id);
    if (admin) {
      const newAdmin = new Admin({
        name: req.body.name,
        age: parseInt(req.body.age),
        admin_id: req.body.adminId,
        mail: req.body.mail,
        mobile: parseInt(req.body.mobile),
        password: req.body.password,
      });

      await newAdmin.save();

      res.status(201).json({ message: "Admin created successfully." });
    } else {
      res.status(400).json({ error: "Unauthorized." });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/admin/create_staff", verifyToken, async (req, res) => {
  try {
    const admin = await Admin.findById(req._id);
    if (admin) {
      res.status(200).json({ message: "hello from create staff page." });
    } else {
      res.status(400).json({ error: "Unauthorized." });
    }
  } catch (error) {
    res.status(500).json({ error: `Server Error: ${error}` });
  }
});

router.post("/admin/create_staff", verifyToken, async (req, res) => {
  try {
    const admin = await Admin.findById(req._id);
    if (admin) {
      const newStaff = new Staff({
        name: req.body.name,
        age: parseInt(req.body.age),
        staff_id: req.body.staffId,
        mail: req.body.mail,
        mobile: parseInt(req.body.mobile),
        identity: req.body.identity,
        identityno: req.body.identityno,
        address: req.body.address,
        pincode: parseInt(req.body.pincode),
        password: req.body.password,
        addedby: req._id,
      });

      await newStaff.save();

      res.status(201).json({ message: "Staff created successfully." });
    } else {
      res.status(400).json({ error: "Unauthorized." });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/admin/orders", verifyToken, async (req, res) => {
  try {
    const admin = await Admin.findById(req._id);
    if (admin) {
      const { cursor, status } = req.query;
      const limit = 25; // Number of products per page

      let query = cursor ? { _id: { $gt: cursor } } : {}; // Create query based on cursor

      // Add additional filters

      // add methods ror addional filters
      // query.date = { $gt: startOfDay };
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

router.patch("/admin/orders/:id", verifyToken, (req, res) => {
  // update the order status by id
  // use websocket to watch changes in realtime
  res.send("sab changa si");
});

// make it data_stream if perfoming slow
router.get("/admin/tickets", verifyToken, async (req, res) => {
  console.log(`from admintickets route: ${req._id}`);
  const admin = await Admin.findById(req._id);
  if (admin) {
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

router.get("/admin/tickets/:id", verifyToken, async (req, res) => {
  try {
    const admin = await Admin.findById(req._id);

    if (admin) {
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

router.patch("/admin/tickets/:id", verifyToken, async (req, res) => {
  try {
    const admin = await Admin.findById(req._id);
    if (admin) {
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

router.get("/admin/products", verifyToken, async (req, res) => {
  try {
    const admin = await Admin.findById(req._id);
    if (admin) {
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

router.post("/admin/products", verifyToken, async (req, res) => {
  try {
    const admin = await Admin.findById(req._id);
    if (admin) {
      let id = Date.now().toString(16);
      while (id.length < 24) {
        id = "0" + id;
      }
      const newProduct = new Product({
        _id: id,
        name: req.body.name,
        price: parseInt(req.body.price),
        type: req.body.type,
        category: req.body.category,
        tag: req.body.tag.split(" "),
        descreption: req.body.descreption,
      });

      newProduct
        .save()
        .then((savedProduct) => {
          res
            .status(201)
            .json({ message: `Product added successfully: ${savedProduct}` });
        })
        .catch((err) => {
          res.status(400).json({ error: `Validation error: ${err}` });
        });
    } else {
      res.status(400).json({ error: "Unauthorized." });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/products/:id", verifyToken, async (req, res) => {
  try {
    const admin = await Admin.findById(req._id);
    if (admin) {
      const body = req.body;
      await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true } // Return the updated document
      );
    } else {
      res.status(400).json({ error: "Unauthorized." });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/admin/products/:id", verifyToken, async (req, res) => {
  try {
    const admin = await Admin.findById(req._id);
    if (admin) {
      const body = req.body;
      await User.findByIdAndDelete(req.params.id);
    } else {
      res.status(400).json({ error: "Unauthorized." });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
