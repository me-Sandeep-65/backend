const express = require("express");
const router = new express.Router();
const flash = require("express-flash");
const Razorpay = require("razorpay");
const Order = require("../models/orderModel");
const User = require("../models/userModel");

const {
  generateJwt,
  verifyPassword,
  verifyToken,
} = require("../middlewares/auth");

const instance = new Razorpay({
  key_id: process.env.RazorPayKey,
  key_secret: process.env.RazorPaySecret,
});

router.post("/checkout", async (req, res) => {
  try {
    const options = {
      amount: Number(req.body.amount) * 100,
      currency: "INR",
    };

    const order = await instance.orders.create(options);
    console.log(order);
    res.json({ message: "successful.", order });
  } catch (error) {
    res.json({ error: error.error.description });
  }
});

router.post("/paymentverification", verifyToken, async (req, res) => {
if (!req.err) {
    console.log("got a hit");
    console.log(req.body);
    try {
        const user= await User.findById(req._id,{name:1});
if (user) {
          const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
            req.body;
      
          var {
            validatePaymentVerification,
            validateWebhookSignature,
          } = require("../node_modules/razorpay/dist/utils/razorpay-utils");
      
          if (
            validatePaymentVerification(
              { order_id: razorpay_order_id, payment_id: razorpay_payment_id },
              razorpay_signature,
              process.env.RazorPaySecret
            )
          ) {
            let productsArray = [];
      
            for (const productId in req.session.cart.items) {
              if (req.session.cart.items.hasOwnProperty(productId)) {
                const quantity = req.session.cart.items[productId].qty;
      
                productsArray.push({
                  product: productId,
                  quantity: quantity,
                });
              }
            }
            console.log(productsArray);
      
            const order = new Order({
              grossTotal: req.session.cart.totalPrice,
              netTotal: req.session.cart.totalPrice,
              products: productsArray,
              status:{
                  status: "pending",
                  by: req._id,
                  role: "user"
              },
              payment: {
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                signature: razorpay_signature,
              },
            });
      
            const newOrder = await order.save();
            console.log(newOrder);
      
            const updatedUser =await User.findByIdAndUpdate(
              req._id,
              {
                $push: { orders: newOrder._id },
              },
              { new: true }        
            );
      
            console.log(updatedUser)
      
            req.session.cart=null;
            req.session.save((err)=>{
              if (err) {
                  throw err;
              }
            })
      
            // res.status(201).redirect(303, `/myorders/${newOrder._id.toString()}`)
            res.status(201).redirect(303, `/myorder`)
          } else {
            req.flash("error", "Payment Pending.");
            res.status(500).json({ error: "Payment Pending." });
          }
} else {
    throw new Error({"error": "User not verified."})
}
    } catch (error) {
      res.status(500).send(error);
    }
} else {
    res.status(400).json({error: "User Unauthorized."})
}

});

router.get("/getkey", (req, res) => {
  res.status(200).json({ key: process.env.RazorPayKey });
});
module.exports = router;
