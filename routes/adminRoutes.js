const express = require("express");
const router = new express.Router();
const bcrypt = require("bcrypt");
const Admin = require("../models/adminModel");
const Complaint = require("../models/complaintModel");
const Product = require("../models/productModel");
const Faq = require("../models/faqModel");
const Order = require("../models/orderModel");
const Staff = require("../models/staffModel");
const path = require("path");
const fs = require("fs");

const { verifyAdminPassword, verifyToken } = require("../middlewares/auth");
const uploadImage = require("../utils/img-upload-multer");
const Contact = require("../models/contactModel");


router.get("/", (req, res) => {
  // console.log(path.join(__dirname, "../public/test.html"))
  // res.send(path.join(__dirname, "../public/test.html"));
  res.status(200).render("adminPartials/adminLogin", { layout: "adminLayout" });
});

router.post("/", verifyAdminPassword, (req, res) => {
  // console.log("in login post");
  // console.log(req.admin);
  // admin login
  if (!req.admin) {
    // console.log("here in if block")
    req.flash("error", "Invalid UserId or Password.");
    res.redirect("/admin");
  } else if (req.admin.error) {
    req.flash("adminId", req.body.adminId);
    req.flash("error", req.admin.error);
    res.status(500).redirect("/admin");
  } else {
    req.flash("adminId", `${req.admin.admin_id}`);
    req.flash("name", `${req.admin.name.split(" ")[0]}`);
    req.flash("message", `User logged in successfully.`);
    res.redirect("/admin/orders");
  }
});

router.get("/faqs", verifyToken, async (req, res) => {
  if (!req.err) {
    try {
      const admin = await Admin.findOne({ _id: req._id }, { password: 0 });

      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        res.status(400).redirect("/admin");
        // direct to login page
      } else {
        res.status(200).render("adminPartials/faq", { layout: "adminLayout" });
      }
    } catch (error) {
      req.flash("error", "Invalid Admin ID or Password.");
      res.status(400).redirect("/admin");
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});

router.get("/faq", verifyToken, async (req, res) => {
  if (!req.err) {
    try {
      const admin = await Admin.findOne({ _id: req._id }, { password: 0 });

      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        res.status(400).redirect("/admin");
        // direct to login page
      } else {
        const { id, question, answer } = req.query;

        res.status(200).render("adminPartials/addFaq", {
          layout: "adminLayout",
          error: "",
          id,
          question,
          answer,
        });
      }
    } catch (error) {
      req.flash("error", "Server Side Error.");
      res.status(500).redirect("/admin/faqs");
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});

router.post("/faq", verifyToken, async (req, res) => {
  if (!req.err) {
    try {
      const admin = await Admin.findOne({ _id: req._id }, { password: 0 });

      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        res.status(400).redirect("/admin");
        // direct to login page
      } else {
        let newFaq = new Faq({
          question: req.body.question,
          answer: req.body.answer,
        });
        newFaq = await newFaq.save();

        res.status(201).redirect("/admin/faq");
      }
    } catch (error) {
      req.flash("error", "Invalid Admin ID or Password.");
      res.status(400).redirect("/admin");
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});

router.patch("/faq/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  if (!req.err) {
    try {
      const admin = await Admin.findOne({ _id: req._id }, { password: 0 });

      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        res.status(400).redirect("/admin");
        // direct to login page
      } else {
        const updatedFaq = await Faq.findByIdAndUpdate(
          id,
          { question: req.body.question, answer: req.body.answer },
          { new: true }
        );
        console.log(updatedFaq);

        if (!updatedFaq) {
          res.status(404).render({
            layout: "adminLayout",
            error: "error",
            id,
            question,
            answer,
          });
        }
        console.log("updated succssfully.");
        req.flash("error", "updated successfully.");
        res.status(303).redirect(303, "/admin/faqs");
      }
    } catch (error) {
      req.flash("error", "Invalid Admin ID or Password.");
      res.status(400).redirect("/admin");
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});

router.get("/deletefaq/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  console.log("got a hit", id);
  if (!req.err) {
    try {
      const admin = await Admin.findOne({ _id: req._id }, { password: 0 });

      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        res.status(400).redirect("/admin");
        // direct to login page
      } else {
        const updatedFaq = await Faq.findByIdAndDelete(id);
        console.log(updatedFaq);

        if (!updatedFaq) {
          res.status(404).render("adminParials/faq", {
            layout: "adminLayout",
          });
        }

        res.status(200).redirect("/admin/faqs");
      }
    } catch (error) {
      req.flash("error", "Invalid Admin ID or Password.");
      res.status(400).redirect("/admin");
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("authorization");
  res.status(200).redirect("/admin");
});

router.get("/profile", verifyToken, async (req, res) => {
  if (!req.err) {
    // console.log("got a hit");
    try {
      const admin = await Admin.findOne({ _id: req._id }, { password: 0 });

      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        res.status(400).redirect("/admin");
        // direct to login page
      } else {
        res.status(200).render("adminPartials/adminProfile", {
          layout: "adminLayout",
          adminImg: admin.image,
          adminId: admin.admin_id,
          name: admin.name,
          age: admin.age,
          mail: admin.mail,
          mobile: admin.mobile,
        });
      }
    } catch (error) {
      req.flash("error", "Invalid Admin ID or Password.");
      res.status(400).redirect("/admin");
    }
  } else {
    req.flash("error", req.err.error);
    res.status(400).redirect("/admin");
  }
});

router.patch("/profile", verifyToken, async (req, res) => {
  if (!req.err) {
    try {
      const admin = await Admin.findOne(
        { _id: req._id, admin_id: req.body.adminId },
        { password: 1 }
      );

      if (
        admin &&
        (await bcrypt.compare(req.body.oldPassword, admin.password))
      ) {
        console.log("updating password")
        const pass = await bcrypt.hash(req.body.newPassword, 10);
        const newadmin = await Admin.findByIdAndUpdate(
          req._id,
          { password: pass },
          { new: true } // Return the updated document
        );

        req.flash("error", "Password Updated Successfully.");
        res.status(201).redirect(303, "/admin/profile");
      } else {
        console.log("password not matched.")
        req.flash("error", "Old password do not matched.");
        res.render('adminPartials/adminLogin' ,{redirectTo: '/admin'});
        // res.status(400).redirect(303, "/admin");
      }
    } catch (error) {
      req.flash("error", "server side error.");
      res.status(500).redirect(303, "/admin");
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});

router.post("/upload-staffProfile-img", verifyToken, async(req, res)=>{
  if (!req.err) {
    try {
      const admin = await Admin.findOne({ _id: req._id }, { password: 0 });
      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        res.status(400).redirect("/admin");
        // direct to login page
      } else {
        // upload image to temp folder
        const image_name = await uploadImage(req, path.join(__dirname, "../temp/profile-img/"));
        res.status(200).json({image_name});
      }
    } catch (error) {
      console.log(error)
      req.flash("error", "Server-side Error.");
      res.status(500).json({message: "Server-side Error."});
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});

router.get("/allstaffs", verifyToken, async (req, res) => {
  console.log("here in all staff");
  if (!req.err) {
    try {
      const admin = await Admin.findOne({ _id: req._id }, { password: 0 });
      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        res.status(400).redirect("/admin");
        // direct to login page
      } else {
        res
          .status(200)
          .render("adminPartials/allStaff", { layout: "adminLayout" });
      }
    } catch (error) {
      req.flash("error", "Invalid Admin ID or Password.");
      res.status(400).redirect("/admin");
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});
router.get("/staff", verifyToken, async (req, res) => {
  if (!req.err) {
    try {
      const admin = await Admin.findOne({ _id: req._id }, { password: 0 });

      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        res.status(400).redirect("/admin");
        // direct to login page
      } else {
        res.status(200).render("adminPartials/addstaff", {
          layout: "adminLayout",
          staffObject: null,
        });
      }
    } catch (error) {
      req.flash("error", "Server Side Error.");
      res.status(500).redirect("/admin/allstaffs");
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});
router.get("/staff/:id", verifyToken, async (req, res) => {
  const staffId = req.params.id;
  if (!req.err) {
    try {
      const admin = await Admin.findOne({ _id: req._id }, { password: 0 });
      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        res.status(400).redirect("/admin");
        // direct to login page
      } else {
        const staff = await Staff.findOne(
          { staff_id: staffId },
          { password: 0 }
        );
        if (!staff) {
          req.flash("error", "Cannot get the Staff.");
          res.status(500).redirect("/admin/staff");
        }

        const staffObject = staff.toObject();
        delete staffObject._id;

        res.status(200).render("adminPartials/addStaff", {
          layout: "adminLayout",
          staffObject,
        });
      }
    } catch (error) {
      req.flash("error", "Server Error.");
      res.status(500).redirect("/admin");
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});

router.post("/staff", verifyToken, async (req, res) => {
  if (!req.err) {
    try {
      const admin = await Admin.findOne({ _id: req._id }, { password: 0 });
      console.log("admin", admin);
      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        res.status(400).redirect("/admin");
        // direct to login page
      } else {
        if (req.body.image_name) {
          const tempImagePath = path.join(__dirname, '../temp/profile-img/', req.body.image_name); // Assuming the temp directory is named 'temp'
          const targetImagePath = path.join(__dirname, '../images/profiles/staffs/', req.body.image_name); // Assuming the images directory is named 'images'
      
          fs.rename(tempImagePath, targetImagePath, function(err) {
            if (err) console.error('Error moving file:', err);
          });
        }

        const staff = new Staff({
          image: req.body.image_name ? req.body.image_name : null,
          staff_id: req.body.staff_id,
          name: req.body.name,
          age: req.body.age,
          mail: req.body.mail,
          mobile: req.body.mobile,
          identitytype: req.body.identity,
          identityno: req.body.identityno,
          address: req.body.address,
          pincode: req.body.pincode,
          password: req.body.password,
          addedby: req._id,
        });

        const newStaff = await staff.save();
        console.log(newStaff);

        req.flash("error", "Staff added successfully.");
        res.redirect(303, `/admin/staff/${newStaff.staff_id}`);
      }
    } catch (error) {
      console.log(error);
      req.flash("error", "Server Side Error.");
      res.status(500).redirect("/admin/orders");
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});

router.patch("/staff/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  console.log(id);
  if (!req.err) {
    try {
      const admin = await Admin.findOne({ _id: req._id }, { password: 0 });
      console.log(admin);
      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        res.status(400).redirect("/admin");
        // direct to login page
      } else {
        const staff = await Staff.findOne({ staff_id: id });
        console.log("staff is here");
        console.log(staff);
        if (!staff) {
          req.flash("error", "The staff id is not found.");
          res.status(400).redirect(303, "/admin/allstaffs");
        } else {
          if (req.body.image_name) {
            const tempImagePath = path.join(__dirname, '../temp/profile-img/', req.body.image_name); // Assuming the temp directory is named 'temp'
            const targetImagePath = path.join(__dirname, '../images/profiles/staffs/', req.body.image_name); // Assuming the images directory is named 'images'
        
            fs.rename(tempImagePath, targetImagePath, function(err) {
              if (err) console.error('Error moving file:', err);
            });
          }

          const newStaff = await Staff.findByIdAndUpdate(
            staff._id,
            {
              image: req.body.image_name ? req.body.image_name : null,
              name: req.body.name,
              age: req.body.age,
              mail: req.body.mail,
              mobile: req.body.mobile,
              identitytype: req.body.identity,
              identityno: req.body.identityno,
              address: req.body.address,
              pincode: req.body.pincode,
            },
            { new: true }
          );

          console.log(newStaff);
          req.flash("error", "Updated Successfully.");
          res.redirect(303, `/admin/staff/${id}`);
        }
      }
    } catch (error) {
      req.flash("error", "Server Side Error.");
      res.status(500).redirect("/admin/orders");
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});

router.get("/deletestaff/:id", async (req, res) => {
  const { id } = req.params;
  console.log("got a hit", id);
  if (!req.err) {
    try {
      const admin = await Admin.findOne({ _id: req._id }, { password: 0 });

      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        res.status(400).redirect("/admin");
        // direct to login page
      } else {
        const staff = Staff.findOne({ staff_id: id });
        if (!staff) {
          req.flash("error", "The staff id is not found.");
          res.status(400).redirect(303, "/admin/allstaffs");
        } else {
          const newStaff = await Staff.findByIdAndDelete(staff_id);

          req.flash("error", "Deleting Successfully.");
          res.status(201).redirect(303, `/admin/faqs`);
        }
      }
    } catch (error) {
      req.flash("error", "Server Side Error.");
      res.status(500).redirect("/admin/faqs");
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});

router.get("/orders", verifyToken, async (req, res) => {
  if (!req.err) {
    try {
      const admin = await Admin.findOne({ _id: req._id }, { password: 0 });
      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        res.status(400).redirect("/admin");
        // direct to login page
      } else {
        res
          .status(200)
          .render("adminPartials/orders", { layout: "adminLayout" });
      }
    } catch (error) {
      req.flash("error", "Server-side Error.");
      res.status(500).redirect("/admin/orders");
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});

router.patch("/order/:id", verifyToken, async (req, res) => {
  console.log("getting hit")
  const {id} = req.params;
  if (!req.err) {
    try {
      const admin = await Admin.findOne({ _id: req._id }, { password: 0 });
      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        res.status(400).redirect("/admin");
        // direct to login page
      } else {
        if(req.query.complete){
          console.log("here confirming otp")
          Order.findById(id,{otp:1})
          .then((response)=>{
            console.log(response)
            if(response.otp===Number(req.body.otp)){
              const statusObj={
                status: "completed",
                by: req._id,
                role: "admin"
              }
              Order.findByIdAndUpdate(id, {status :statusObj}).then(()=>{
                res.status(201).json({message: "update successful."})
              }).catch((err)=>{
                throw err
              })
            }
            else{
              throw new Error({error: "OTP Mismatched."})
            }
          }).catch((err)=>{
            throw err
          })
        }
        else if(req.query.confirm){
          const statusObj={
            status: "waiting",
            by: req._id,
            role: "admin"
          }
          waitingTime=req.body.waitingTime
          otp=Math.floor(100000 + Math.random() * 900000)

          Order.findByIdAndUpdate(id,{otp, waitingTime, status: statusObj})
          .then((response)=>{
            console.log(response)
              res.status(201).json({message: "update successful."})
          }).catch((err)=>{
            throw err
          })
        }
        else{
          const statusObj={
            status: "cancelled",
            by: req._id,
            role: "admin"
          }

          Order.findByIdAndUpdate(id,{otp, status: statusObj})
          .then((response)=>{
            console.log(response)
              res.status(201).json({message: "update successful."})
          }).catch((err)=>{
            throw err
          })
        }
      }
    } catch (error) {
      req.flash("error", "Server-side Error.");
      res.status(500).redirect("/admin/orders");
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});

// make it data_stream if perfoming slow
router.get("/alltickets", verifyToken, async (req, res) => {
  console.log(`from admintickets route: ${req._id}`);
  if (!req.err) {
    try {
      const admin = await Admin.findOne({ _id: req._id }, { password: 0 });
      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        res.status(400).redirect("/admin");
        // direct to login page
      } else {
        res
          .status(200)
          .render("adminPartials/adminTicket", { layout: "adminLayout" });
      }
    } catch (error) {
      req.flash("error", "Server-side Error.");
      res.status(500).redirect("/admin/orders");
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});

router.get("/ticket/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  if (!req.err) {
    try {
      const admin = await Admin.findById(req._id, { password: 0 });
      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        res.status(400).redirect("/admin");
        // direct to login page
      } else {
        const ticket = await Complaint.findById(id).populate({
          path: "userId",
          select: "name age mail mobile",
        });

        if (!ticket) {
          req.flash("error", "Invalid Ticket ID.");
          res.status(200).redirect("/admin/alltickets");
        }

        res.status(200).render("adminPartials/ticket", {
          layout: "adminLayout",
          ticket,
        });
      }
    } catch (error) {
      console.log(error);
      req.flash("error", "Server-side Error.");
      res.status(500).redirect("/admin/alltickets");
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});

router.patch("/ticket/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  console.log("the id is ", id);

  console.log(req.body);
  if (!req.err) {
    try {
      const admin = await Admin.findById(req._id, { password: 0 });
      console.log(admin);
      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        res.status(400).redirect("/admin");
        // direct to login page
      } else {
        if (req.query.resolve) {
          const newTicket = await Complaint.findByIdAndUpdate(
            id,
            {
              status: "Resolved",
            },
            { new: true }
          );

          console.log("newProduct", newTicket);
          req.flash("error", "Updated Successfully.");
          res.redirect(303, `/admin/ticket/${id}`);
        } else {
          const newConversation = {
            body: req.body.textMsg,
            by: req._id,
            role: "Admin",
          };

          await Complaint.findByIdAndUpdate(
            id,
            { $push: { conversation: newConversation } },
            { new: true }
          );

          req.flash("error", "Updated Successfully.");
          res.redirect(303, `/admin/ticket/${id}`);
        }
      }
    } catch (error) {
      console.log(error);
      req.flash("error", "Server Side Error.");
      res.status(500).redirect(303, "/admin/alltickets");
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});

router.post("/upload-product-img", verifyToken, async(req, res)=>{
  if (!req.err) {
    try {
      const admin = await Admin.findOne({ _id: req._id }, { password: 0 });
      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        res.status(400).redirect("/admin");
        // direct to login page
      } else {
        // upload image to temp folder
        const image_name = await uploadImage(req, path.join(__dirname, "../temp/product-img/"));
        res.status(200).json({image_name});
      }
    } catch (error) {
      console.log(error)
      req.flash("error", "Server-side Error.");
      res.status(500).json({message: "Server-side Error."});
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});

router.get("/allproducts", verifyToken, async (req, res) => {
  // console.log(`from adminproducts route: ${req._id}`);
  if (!req.err) {
    try {
      const admin = await Admin.findOne({ _id: req._id }, { password: 0 });
      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        res.status(400).redirect("/admin");
        // direct to login page
      } else {
        res
          .status(200)
          .render("adminPartials/allProduct", { layout: "adminLayout" });
      }
    } catch (error) {
      req.flash("error", "Server-side Error.");
      res.status(500).redirect("/admin/orders");
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});

router.get("/product", verifyToken, async (req, res) => {
  if (!req.err) {
    try {
      const admin = await Admin.findOne({ _id: req._id }, { password: 0 });

      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        res.status(400).redirect("/admin");
        // direct to login page
      } else {
        res.status(200).render("adminPartials/adminProduct", {
          layout: "adminLayout",
          productObject: null,
        });
      }
    } catch (error) {
      req.flash("error", "Server Side Error.");
      res.status(500).redirect("/admin/allproducts");
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});

router.get("/product/:id", verifyToken, async (req, res) => {
  const productId = req.params.id;
  if (!req.err) {
    try {
      const admin = await Admin.findOne({ _id: req._id }, { password: 0 });
      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        res.status(400).redirect("/admin");
        // direct to login page
      } else {
        const product = await Product.findById(productId, { reviews: 0 });
        if (!product) {
          req.flash("error", "Cannot get the Product.");
          res.status(500).redirect("/admin/product");
        }

        const productObject = product.toObject();

        res.status(200).render("adminPartials/adminProduct", {
          layout: "adminLayout",
          productObject,
        });
      }
    } catch (error) {
      req.flash("error", "Server Error.");
      res.status(500).redirect("/admin");
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});

router.post("/product", verifyToken, async (req, res) => {
  console.log("here in product post");
  if (!req.err) {
    try {
      const admin = await Admin.findOne({ _id: req._id }, { password: 0 });
      console.log("admin", admin);
      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        res.status(400).redirect("/admin");
        // direct to login page
      } else {
        if (req.body.image_name) {
          const tempImagePath = path.join(__dirname, '../temp/product-img/', req.body.image_name); // Assuming the temp directory is named 'temp'
          const targetImagePath = path.join(__dirname, '../images/products/', req.body.image_name); // Assuming the images directory is named 'images'
      
          fs.rename(tempImagePath, targetImagePath, function(err) {
            if (err) console.error('Error moving file:', err);
          });
        }

        const product = new Product({
          image: req.body.image_name ? req.body.image_name : null,
          name: req.body.name,
          price: req.body.price,
          category: req.body.category,
          type: req.body.type,
          tag: req.body.tag,
          description: req.body.description,
        });

        const newProduct = await product.save();
        console.log(newProduct);
        console.log("newProduct id ", newProduct._id.toString());
        const id = newProduct._id.toString();
        console.log("id", id);

        req.flash("error", "Updated Successfully.");
        res.redirect(303, `/admin/product/${id}`);
      }
    } catch (error) {
      console.log(error);
      req.flash("error", "Server Side Error.");
      res.status(500).redirect("/admin/allproducts");
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});

router.patch("/product/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  if (!req.err) {
    try {
      const admin = await Admin.findOne({ _id: req._id }, { password: 0 });
      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        res.status(400).redirect("/admin");
        // direct to login page
      } else {
        if (req.body.image_name) {
          const tempImagePath = path.join(__dirname, '../temp/product-img/', req.body.image_name); // Assuming the temp directory is named 'temp'
          const targetImagePath = path.join(__dirname, '../images/products/', req.body.image_name); // Assuming the images directory is named 'images'
      
          fs.rename(tempImagePath, targetImagePath, function(err) {
            if (err) console.error('Error moving file:', err);
          });
        }

        const newProduct = await Product.findByIdAndUpdate(
          id,
          {
            image: req.body.image_name ? req.body.image_name : null,
            name: req.body.name,
            price: req.body.price,
            category: req.body.category,
            type: req.body.type,
            tag: req.body.tag,
            description: req.body.description,
          },
          { new: true }
        );

        req.flash("error", "Updated Successfully.");
        res.redirect(303, `/admin/product/${id}`);
      }
    } catch (error) {
      req.flash("error", "Server Side Error.");
      res.status(500).redirect("/admin/allproducts");
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});

router.get("/deleteproduct/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  console.log("got a hit", id);
  if (!req.err) {
    try {
      const admin = await Admin.findOne({ _id: req._id }, { password: 0 });

      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        res.status(400).redirect("/admin");
        // direct to login page
      } else {
        const newProduct = await Product.findByIdAndDelete(id);

        req.flash("error", "Deleting Successfully.");
        res.status(201).redirect(303, `/admin/allproducts`);
      }
    } catch (error) {
      req.flash("error", "Server Side Error.");
      res.status(500).redirect("/admin/allproducts");
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});

router.get("/contacts", verifyToken, async (req, res) => {
  if (!req.err) {
    try {
      const admin = await Admin.findOne({ _id: req._id }, { password: 0 });

      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        res.status(400).redirect("/admin");
        // direct to login page
      } else {
        res
          .status(200)
          .render("adminPartials/contact", { layout: "adminLayout" });
      }
    } catch (error) {
      req.flash("error", "Invalid Admin ID or Password.");
      res.status(400).redirect("/admin");
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});

router.get("/contacts-by-cursor", verifyToken, async (req, res) => {
  if (!req.err) {
    try {
      const admin = await Admin.findOne({ _id: req._id }, { password: 0 });

      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        // res.status(400).redirect("/admin");
        // direct to login page
      } else {
        const limit = parseInt(req.query.limit) || 10; // Default limit
        const cursor = req.query.cursor;

        let query = cursor ? { _id: { $lt: cursor } } : {}; // Create query based on cursor

        const contacts = await Contact.find(query)
          .sort({ _id: -1 })
          .limit(limit + 1);
        const hasNextPage = contacts.length > limit;
        if (hasNextPage) {
          contacts.pop();
        }

        const nextCursor = hasNextPage
          ? contacts[contacts.length - 1]._id
          : null;

        res.json({
          hasNextPage,
          nextCursor,
          contacts,
        });
      }
    } catch (error) {
      req.flash("error", "Invalid Admin ID or Password.");
      res.status(400).redirect("/admin");
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});

router.get("/staffs-by-cursor", verifyToken, async (req, res) => {
  if (!req.err) {
    try {
      const admin = await Admin.findOne({ _id: req._id }, { password: 0 });

      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        // res.status(400).redirect("/admin");
        // direct to login page
      } else {
        const limit = parseInt(req.query.limit) || 10; // Default limit
        const cursor = req.query.cursor;

        let query = cursor ? { _id: { $lt: cursor } } : {}; // Create query based on cursor

        const staffs = await Staff.find(query)
          .select("name age staff_id mail mobile")
          .sort({ _id: -1 })
          .limit(limit + 1);
        const hasNextPage = staffs.length > limit;
        if (hasNextPage) {
          staffs.pop();
        }

        const nextCursor = hasNextPage ? staffs[staffs.length - 1]._id : null;

        res.json({
          hasNextPage,
          nextCursor,
          staffs,
        });
      }
    } catch (error) {
      req.flash("error", "Invalid Admin ID or Password.");
      res.status(400).redirect("/admin");
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});
router.get("/tickets-by-cursor", verifyToken, async (req, res) => {
  if (!req.err) {
    try {
      const admin = await Admin.findOne({ _id: req._id }, { password: 0 });

      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        res.status(400).redirect("/admin");
        // direct to login page
      } else {
        const limit = parseInt(req.query.limit) || 10; // Default limit
        const cursor = req.query.cursor;
        const filter = req.query.filter;

        let query = cursor ? { _id: { $lt: cursor } } : {}; // Create query based on cursor

        if (filter !== "") {
          query.status = filter;
        }

        const tickets = await Complaint.aggregate([
          { $match: query },
          {
            $project: {
              orderId: 1,
              userId: 1,
              status: 1,
              // Project the last element of the conversations array
              lastConversation: { $arrayElemAt: ["$conversation", -1] },
            },
          },

          { $sort: { _id: -1 } },

          { $limit: limit + 1 },
        ]);

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
      req.flash("error", "Server Side Error.");
      res.status(500).redirect("/admin");
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});

router.get("/orders-by-cursor", verifyToken, async (req, res) => {
  if (!req.err) {
    try {
      const admin = await Admin.findOne({ _id: req._id }, { password: 0 });

      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        res.status(400).redirect("/admin");
        // direct to login page
      } else {
        const limit = parseInt(req.query.limit) || 10; // Default limit
        const cursor = req.query.cursor;
        const filter = req.query.filter;


        let query = cursor ? { _id: { $lt: cursor } } : {}; // Create query based on cursor

        if (filter !== "") {
          // query.status = {}; // Initialize status property if it doesn't exist
          query['status.status'] = filter;
        }
        // console.log(query)

        Order.find(query)
          .populate({
            path: "products.product",
            select: "name type price",
            model: "Product",
          })
          .sort({ _id: -1 })
          .limit(limit + 1)
          .exec()
          .then((orders) => {
            // console.log("here is the orders", orders)
            const hasNextPage = orders.length > limit;
            if (hasNextPage) {
              orders.pop();
            }

            const nextCursor = hasNextPage
              ? orders[orders.length - 1]._id
              : null;

              // console.log(orders)

            res.json({
              hasNextPage,
              nextCursor,
              orders,
            });
          })
          .catch((err) => {
            throw err;
          });
      }
    } catch (error) {
      console.log(error)
      req.flash("error", "Server Side Error.");
      res.status(500).redirect("/admin");
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});

router.get("/products-by-cursor", verifyToken, async (req, res) => {
  if (!req.err) {
    try {
      const admin = await Admin.findOne({ _id: req._id }, { password: 0 });

      if (!admin) {
        req.flash("error", "Invalid Admin ID or Password.");
        res.status(400).redirect("/admin");
        // direct to login page
      } else {
        const limit = parseInt(req.query.limit) || 6; // Default limit
        const cursor = req.query.cursor;
        const filter = req.query.filter;

        let query = cursor ? { _id: { $lt: cursor } } : {}; // Create query based on cursor

        if (filter && filter !== "") {
          query.status = filter;
        }

        console.log("cursor: ", cursor);

        const products = await Product.find(query, { review: 0 })
          .sort({ _id: -1 })
          .limit(limit + 1);

        const hasNextPage = products.length > limit;
        if (hasNextPage) {
          products.pop();
        }

        const nextCursor = hasNextPage
          ? products[products.length - 1]._id
          : null;

        // console.log(products)

        res.json({
          hasNextPage,
          nextCursor,
          products,
        });
      }
    } catch (error) {
      console.log(error);
      req.flash("error", "Server Side Error.");
      res.status(500).redirect("/admin");
    }
  } else {
    req.flash("error", "Invalid Admin ID or Password.");
    res.status(400).redirect(303, "/admin");
  }
});

module.exports = router;
