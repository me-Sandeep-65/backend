const express = require("express");
const router = new express.Router();
const milter = require("multer")
const mongoose = require("mongoose");
const flash = require("express-flash");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Contact = require("../models/contactModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const Faq = require("../models/faqModel");
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
  res.render("partials/home");
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

    req.flash("name", `${newUser.name.split(" ")[0]}`);
    req.flash("message", `User signed up successfully.`);
    res.status(201).redirect("/login");
  } catch (error) {
    error = [error.errors];
    const firstField = Object.values(error[0])[0]; // Get the first field of the error object
    req.flash("error", firstField.properties.message);
    res.status(500).redirect("/login?signup=true");
  }
});

router.get("/login", (req, res) => {
  if (!req.query.signup) {
    res.status(200).render("partials/login");
  } else {
    res.status(200).render("partials/signup");
  }
});

router.post("/login", verifyPassword, (req, res) => {
  // user login
  if (!req.user) {
    // console.log("here in if block")
    req.flash("error", "Invalid UserId or Password.");
    res.redirect("/login");
  } else if (req.user.error) {
    req.flash("mail", req.body.mail);
    req.flash("error", req.user.error);
    res.status(500).redirect("/login");
  } else {
    res.cookie("userName", req.user.name.split()[0].trim(), { httpOnly: true });
    res.redirect("/");
  }
});

router.get("/myprofile", verifyToken, async (req, res) => {
  console.log(req._id);
  try {
    const user = await User.findById(req._id, {
      password: 0,
      cart: 0,
      tokens: 0,
      orders: 0,
    });

    if (!user) {
      res.status(400).json({ message: "User not found." });
      // direct to login page
    } else {
      res.status(200).render("partials/profile", {
        user,
      });
    }
  } catch (error) {
    res.status(500).json({ message: `Server side error: ${error}` });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("authorization");
  res.clearCookie("userName");
  res.redirect("/");
});

router.patch("/myprofile", verifyToken, async (req, res) => {
  if (!req.err) {
    try {
      if (!req.body.oldPassword) {
        const user = await User.findByIdAndUpdate(req._id, req.body);
        if (!user) {
          throw new Error("User not found.");
        }

        res.status(201).send({ message: "Profile info updated successfully." });
      } else {
        const user = await User.findById(req._id, { password: 1 });

        // console.log(await bcrypt.compare(req.body.oldPassword, user.password))
        if (
          user &&
          (await bcrypt.compare(req.body.oldPassword, user.password))
        ) {
          const pass = await bcrypt.hash(req.body.newPassword, 10);
          const newuser = await User.findByIdAndUpdate(
            req._id,
            { password: pass },
            { new: true } // Return the updated document
          );

          req.flash("error", "Password Updated Successfully.");
          res.status(201).redirect(303, "/myprofile");
        } else {
          throw new Error("Invalid Old Password.");
          req.flash("error", "Invalid Old Password.");
          res.status(400).redirect(303, "/");
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  } else {
    req.flash("error", "Unaurhorized.");
    res.status(400).redirect(303, "/");
  }
});

router.get("/mycart", async (req, res) => {
  res.status(200).render("partials/cart");
  // try {
  //   const user = await User.findOne({ _id: req._id }, { _id: 1, cart: 1 });

  //   if (!user) {
  //     res.status(400).json({ message: "User not found." });
  //     // direct to login page
  //   } else {
  //     res.status(200).render("cart");
  //   }
  // } catch (error) {
  //   res.status(500).json({ message: `Server side error: ${error}` });
  // }
});

router.post("/mycart", async (req, res) => {
  try {
    // console.log(req.body)
    if (!req.session.cart) {
      req.session.cart = {
        items: {},
        totalQty: 0,
        totalPrice: 0,
      };
    }

    let cart = req.session.cart;

    if (cart.items[req.body.id]) {
      cart.items[req.body.id].qty += 1;
    } else {
      cart.items[req.body.id] = {
        item: req.body,
        qty: 1,
      };
    }

    cart.totalQty += 1;
    cart.totalPrice += req.body.price;

    req.session.save((err) => {
      if (err) {
        throw err;
      }
      res.json({ counter: req.session.cart.totalQty });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "something went wrong." });
  }
});

// router.get("/myorders", verifyToken, async (req, res) => {
//   if (!req.err) {
//     try {
//       res.status(200).render("partials/allOrders");
//     } catch (error) {
//       res.status(500).send(error);
//     }
//   } else {
//     res.status(400).json({ error: "User Unauthorized." });
//   }
// });

// router.get("/order", verifyToken, async (req, res) => {
//   if (!req.err) {
//     try {
//       const limit = parseInt(req.query.limit) || 1; // Default limit
//       const cursor = req.query.cursor;
//       const filter = req.query.filter;

//       // let query = cursor ? { _id: { $lt: cursor } } : {}; // Create query based on cursor

//       // if (filter !== "") {
//       //   query.status = filter;
//       // }

//       // console.log(req._id)
//       // const orders =await User.findById(req._id)
//       // console.log(orders)

//       const orders = await User.aggregate([
//         {
//           $match: {
//             _id: new mongoose.Types.ObjectId(req._id)
//           },
//         },
//         {
//           $project: {
//             orders: {
//               $slice: ['$orders', -(Number(cursor)+Number(limit)+1), (Number(limit)+1)] // Get the second last 5 elements of the orders array
//             }
//           }
//         },
//         {
//           $unwind: '$orders' // Unwind the orders array to get separate documents for each order
//         },
//         {
//           $sort: {
//             'orders': -1 // Sort the order IDs in descending order
//           }
//         },
//         {
//           $lookup: {
//             from: 'orders', // The collection to join with
//             localField: 'orders', // Field from the current collection
//             foreignField: '_id', // Field from the orders collection
//             as: 'order' // Alias for the joined documents
//           }
//         },
//         {
//           $unwind: '$order' // Unwind the joined order documents
//         },
//         {
//           $lookup: {
//             from: 'products', // The collection to join with
//             localField: 'order.products.product', // Field from the order documents
//             foreignField: '_id', // Field from the products collection
//             as: 'order.products' // Alias for the joined documents
//           }
//         },
//         // {
//         //   $group: {
//         //     _id: '$_id', // Group by user ID
//         //     orders: { $push: '$order' } // Push the orders into an array
//         //   }
//         // }
//       ]);
//       console.log(orders);
//       console.log(orders.length)

//       const hasNextPage = orders.length > limit;
//       if (hasNextPage) {
//         orders.pop();
//       }

//       const nextCursor = hasNextPage ? Number(cursor) + Number(limit) : null;

//       res.json({
//         hasNextPage,
//         nextCursor,
//         orders,
//       });
//     } catch (error) {
//       console.log(error)
//       res.status(500).send(error);
//     }
//   } else {
//     res.status(400).json({ error: "User Unauthorized." });
//   }
// });

router.get("/myorder", verifyToken, async (req, res) => {
  if (!req.err) {
    try {
      User.findById(req._id, { orders: 1 })
        .populate({
          path: "orders",
          select: "waitingTime otp date status payment netTotal products.quantity", // Select fields from orders
          populate: {
            path: "products.product",
            select: "name price type", // Select fields from products
          },
        })
        .exec()
        .then((user) => {
          console.log(user.orders);
          // res.json(user.orders)
          res.status(200).render("partials/allOrders", { orders: user.orders });
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      res.status(500).send(error);
    }
  } else {
    res.status(400).json({ error: "User Unauthorized." });
  }
});

// router.get("/myorders/:id", verifyToken, async (req, res) => {
//   const { id } = req.params;
//   try {
//     const order = await Order.findById(id);

//     res.status(200).json({ placedOrder: order });
//   } catch (error) {
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// router.patch("/myorders", verifyToken, (req, res) => {
//   res.send("sab changa si");
// });

router.get("/products-by-cursor", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6; // Default limit
    const cursor = req.query.cursor;
    const filter = req.query.filter;

    let query = cursor ? { _id: { $lt: cursor } } : {}; // Create query based on cursor

    if (filter && filter !== "") {
      query.status = filter;
    }

    const products = await Product.find(query, { review: 0 })
      .sort({ _id: -1 })
      .limit(limit + 1);

    const hasNextPage = products.length > limit;
    if (hasNextPage) {
      products.pop();
    }

    const nextCursor = hasNextPage ? products[products.length - 1]._id : null;

    // console.log(products)

    res.json({
      hasNextPage,
      nextCursor,
      products,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Server Side Error.");
    res.status(500).redirect("/admin");
  }
});

router.get("/faqs", (req, res) => {
  res.status(200).render("partials/faq");
});

router.get("/fetch-faq-by-cursor", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // Default limit
    const cursor = req.query.cursor;

    let query = cursor ? { _id: { $lt: cursor } } : {}; // Create query based on cursor

    const faqs = await Faq.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1);
    const hasNextPage = faqs.length > limit;
    if (hasNextPage) {
      faqs.pop();
    }

    const nextCursor = hasNextPage ? faqs[faqs.length - 1]._id : null;

    res.json({
      hasNextPage,
      nextCursor,
      faqs,
    });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/raise_ticket/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  if (!req.err) {
    try {
      const user = await User.findById(req._id);
      if (!user) {
        throw new Error({ error: "User not found." });
      } else {
        res.status(200).render("partials/newTicket", { orderId: id });
      }
    } catch (error) {
      res.status.json({ error: error });
    }
  } else {
    res.status(400).json({ error: "user unauthorized." });
  }
});

router.post("/raise_ticket", verifyToken, async (req, res) => {
  const { orderId, body } = req.body;
  console.log(req.body);

  if (!req.err) {
    try {
      const user = await User.findById(req._id);
      console.log(user);
      if (!user) {
        throw new Error({ error: "User not found." });
      } else {
        const conversationObject = {
          body: body,
          by: req._id,
          role: "user",
        };

        const complaint = new Complaint({
          userId: req._id,
          orderId,
          conversation: [conversationObject],
        });

        const newComplaint = await complaint.save();
        console.log(newComplaint);

        res.status(201).redirect(303, "/tickets");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error });
    }
  } else {
    res.status(400).json({ error: "user unauthorized." });
  }
});

router.get("/tickets", (req, res) => {
  res.status(200).render("partials/tickets");
});

// make it data_stream if perfoming slow
router.get("/ticket", verifyToken, async (req, res) => {
  console.log("got a hit")
  if (!req.err) {
    try {
      const user = await User.findById(req._id, { name: 1 });

      if (!user) {
        throw new Error({ error: "User Not Found." });
      } else {
        const limit = parseInt(req.query.limit) || 2; // Default limit
        const cursor = req.query.cursor;
        const filter = req.query.filter;

        let query = cursor ? { _id: { $lt: cursor } } : {}; // Create query based on cursor
        query.userId = req._id;
        if(filter){
          query.status=filter;
        }

        const tickets = await Complaint.find(query)
          .sort({ _id: -1 })
          .limit(limit + 1);
        const hasNextPage = tickets.length > limit;
        if (hasNextPage) {
          tickets.pop();
        }

        const nextCursor = hasNextPage ? tickets[tickets.length - 1]._id : null;

        res.json({
          hasNextPage,
          nextCursor,
          tickets,
        });
      }
    } catch (error) {
      console.error("Error fetching Tickets:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(400).json({ error: "User Unauthorized." });
  }
});

router.get("/ticket/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  if (!req.err) {
    try {
      const user = await User.findById(req._id, { password: 0 });
      if (!user) {
        req.flash("error", "Invalid Admin ID or Password.");
        res.status(400).redirect("/login");
        // direct to login page
      } else {
        const ticket = await Complaint.findById(id)

        if (!ticket) {
          req.flash("error", "Invalid Ticket ID.");
          res.status(200).redirect("/admin/alltickets");
        }
        console.log(ticket)
        res.status(200).render("partials/userTicket", {
          ticket,
        });
      }
    } catch (error) {
      console.log(error);
      req.flash("error", "Server-side Error.");
      res.status(500).redirect("/tickets");
    }
  } else {
    req.flash("error", "Invalid User mail or Password.");
    res.status(400).redirect(303, "/login");
  }
});

router.patch("/ticket/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  console.log("the id is ",id);

  console.log(req.body)
  if (!req.err) {
    try {
      const user = await User.findById( req._id, { password: 0 });
      console.log(user);
      if (!user) {
        req.flash("error", "Invalid User mail or Password.");
        res.status(400).redirect("/login");
        // direct to login page
      } else {
            const newConversation = {
              body: req.body.textMsg,
              by: req._id,
              role: "user" 
            };

            await Complaint.findByIdAndUpdate(
              id,
              { $push: { conversation: newConversation } },
              { new: true },
            );

            req.flash("error", "Updated Successfully.");
            res.redirect(303, `/ticket/${id}`);
          }
    } catch (error) {
      console.log(error)
      req.flash("error", "Server Side Error.");
      res.status(500).redirect(303, "/tickets");
    }
  } else {
    req.flash("error", "Invalid User mail or Password.");
    res.status(400).redirect(303, "/login");
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
