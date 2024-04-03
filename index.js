const express = require("express");
const connectDB = require("./connectMongo.js");
const userRoutes = require("./routes/userRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const staffRoutes = require("./routes/staffRoutes.js");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const ejs = require("ejs");
const expressLayouts = require("express-ejs-layouts");

const app = express();
const port = process.env.PORT || 8000;

// function call to connect to database
connectDB();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "/public")));
// app.use(expressLayouts);
app.set("views", "./templates/views");
app.set("view engine", "ejs");


app.use("/staff", staffRoutes);
app.use("/admin", adminRoutes);
app.use("/", userRoutes);

app.get("/*", (req, res) => {
  res.status(404).send("404 error.");
});

app.listen(port, () => {
  console.log(`server is live on port ${port}`);
});
