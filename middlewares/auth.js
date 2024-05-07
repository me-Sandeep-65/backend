const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const newUser = require("../models/userModel");
const newAdmin = require("../models/adminModel");
const newStaff = require("../models/staffModel");
require("dotenv").config();

const generateJwt = (_id) => {
  return jwt.sign({ _id }, process.env.JwtSecret);
};

async function verifyPassword(req, res, next) {
  try {
    const user = await newUser.findOne(
      { mail: req.body.mail }, // Query criteria
      { _id: 1, name: 1, password: 1 } // Projection: 1 indicates to include the field, 0 indicates to exclude
    );

    if (user && (await bcrypt.compare(req.body.password, user.password))) {
      const token = generateJwt(user._id);
      res.cookie("authorization", "Bearer " + token, { httpOnly: true });
      // console.log("User logged in successfully.");

      const userObject = user.toObject();
      delete userObject.password;
      req.user = userObject;
      next();
    } else {
      req.user = null;
      next();
    }
  } catch (error) {
    req.user = {
      error: "Server side error.",
    };
    next();
  }
}

const verifyToken = (req, res, next) => {
if (req.cookies.authorization) {
    const token = req.cookies.authorization.split(" ")[1];
    // console.log(token)
  
    jwt.verify(token, process.env.JwtSecret, (eror, { _id }) => {
      if (eror) {
        req.err={
          error: "user not autherized. please login again."
        }      }
      // console.log(_id);
      req._id = _id;
    });
  
    next();
} else {
  req.err={
    error: "user not autherized. please login again."
  }
  next()
}
};

// Admin verifications
async function verifyAdminPassword(req, res, next) {
  console.log("in admin Password")
  console.log(req.body.adminId)
  console.log(req.body.password)
  try {
    const admin = await newAdmin.findOne(
      { admin_id: req.body.adminId }, // Query criteria
      { _id: 1, name: 1, admin_id:1, password: 1 } // Projection: 1 indicates to include the field, 0 indicates to exclude
    );
    console.log(admin)
    console.log(await bcrypt.hash(req.body.password, 10))

    if (admin && await bcrypt.compare(req.body.password, admin.password)) {
      const token = generateJwt(admin._id);
      res.cookie("authorization", "Bearer " + token, { httpOnly: true });
      // console.log("User logged in successfully.");

      const adminObject = admin.toObject();
      delete adminObject.password;
      req.admin = adminObject;
      next();
    } else {
      req.admin =null;
      next();    }
  } catch (error) {
    req.admin = {
      error: "Server side error.",
    };
    next();  
  }
}

// Staff verifications
async function verifyStaffPassword(req, res, next) {
  try {
    const staff = await newStaff.findOne(
      { staff_id: req.body.staffId }, // Query criteria
      { _id: 1, name: 1, staff_id:1, password: 1 } // Projection: 1 indicates to include the field, 0 indicates to exclude
    );

    if (staff && (await bcrypt.compare(req.body.password, staff.password))) {
      const token = generateJwt(staff._id);
      res.cookie("authorization", "Bearer " + token, { httpOnly: true });
      // console.log("User logged in successfully.");

      const staffObject = staff.toObject();
      delete staffObject.password;
      req.staff = staffObject;
      next();
    } else {
      req.staff = staff;
      next();
    }
  } catch (error) {
    req.staff = {
      error: "Server side error.",
    };
    next();
  }
}

module.exports.verifyPassword = verifyPassword;
module.exports.verifyToken = verifyToken;
module.exports.generateJwt = generateJwt;

// export admin password verification middleware
module.exports.verifyAdminPassword = verifyAdminPassword;

// export staff password verification middleware
module.exports.verifyStaffPassword = verifyStaffPassword;
