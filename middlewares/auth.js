const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const newUser = require("../models/userModel");
const newAdmin = require("../models/adminModel");
const newStaff = require("../models/staffModel");
require("dotenv").config();

const generateJwt = (_id) => {
  return jwt.sign({ _id }, process.env.secret_key);
};

async function verifyPassword(req, res, next) {
  try {
    const user = await newUser.findOne(
      { mail: req.body.mail }, // Query criteria
      { _id: 1, name: 1, password: 1 } // Projection: 1 indicates to include the field, 0 indicates to exclude
    );

    if (await bcrypt.compare(req.body.password, user.password)) {
      const token = generateJwt(user._id);
      res.cookie("authorization", "Bearer " + token, { httpOnly: true });
      // console.log("User logged in successfully.");

      const userObject = user.toObject();
      delete userObject.password;
      req.user = userObject;
      next();
    } else {
      res.send(new error("Email or Password is Invalid."));
    }
  } catch (error) {
    res.send("No such user found.");
  }
}

const verifyToken = (req, res, next) => {
  //   const token = req.cookies.authorization.split(" ")[1];
  const token = req.headers.authorization.split(" ")[1];
  // console.log(token)

  jwt.verify(token, process.env.secret_key, (err, { _id }) => {
    if (err) {
      res.send("user not autherized. please login again.");
    }
    console.log(_id);
    req._id = _id;
  });

  next();
};

// Admin verifications
async function verifyAdminPassword(req, res, next) {
  try {
    const admin = await newAdmin.findOne(
      { admin_id: req.body.adminId }, // Query criteria
      { _id: 1, name: 1, password: 1 } // Projection: 1 indicates to include the field, 0 indicates to exclude
    );

    if (await bcrypt.compare(req.body.password, admin.password)) {
      const token = generateJwt(admin._id);
      res.cookie("authorization", "Bearer " + token, { httpOnly: true });
      // console.log("User logged in successfully.");

      const adminObject = admin.toObject();
      delete adminObject.password;
      req.admin = adminObject;
      next();
    } else {
      res.send(new error("Admin ID or Password is Invalid."));
    }
  } catch (error) {
    res.send("No such admin found.");
  }
}

// Staff verifications
async function verifyStaffPassword(req, res, next) {
  try {
    const staff = await newStaff.findOne(
      { staff_id: req.body.staffId }, // Query criteria
      { _id: 1, name: 1, password: 1 } // Projection: 1 indicates to include the field, 0 indicates to exclude
    );

    if (await bcrypt.compare(req.body.password, staff.password)) {
      const token = generateJwt(staff._id);
      res.cookie("authorization", "Bearer " + token, { httpOnly: true });
      // console.log("User logged in successfully.");

      const staffObject = staff.toObject();
      delete staffObject.password;
      req.staff = staffObject;
      next();
    } else {
      res.send(new error("Staff ID or Password is Invalid."));
    }
  } catch (error) {
    res.send("No such staff found.");
  }
}

module.exports.verifyPassword = verifyPassword;
module.exports.verifyToken = verifyToken;
module.exports.generateJwt = generateJwt;

// export admin password verification middleware
module.exports.verifyAdminPassword = verifyAdminPassword;

// export staff password verification middleware
module.exports.verifyStaffPassword = verifyStaffPassword;
