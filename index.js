const express = require("express");
const connectDB = require("./utils/connectMongo.js");
const changeStream = require("./utils/changeStream.js");
const { initializeRecommendations } = require("./utils/recommendation.js");
const bulkRoutes = require("./routes/bulkRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const staffRoutes = require("./routes/staffRoutes.js");
const paymentRoutes = require("./routes/paymentRoutes.js");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const flash = require("express-flash");
const ejs = require("ejs");
const expressLayouts = require("express-ejs-layouts");
const cors= require("cors");
const Emitter = require("events");

const app = express();
const port = process.env.PORT || 8000;

// function call to connect to database
connectDB();
initializeRecommendations();

// create event emitter for realTime status update
const eventEmitter = new Emitter();
app.set("eventEmitter", eventEmitter);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.SessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 },
  })
);
app.use(flash());
app.use(cookieParser());
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});


app.use(cors())
app.use(express.static(path.join(__dirname, "/public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(expressLayouts);
app.set("views", "./templates/views");
app.set("view engine", "ejs");
app.use((req, res, next) => {
  // Set variables on res.locals
  res.locals.userName = req.cookies.userName;
  next();
});

app.use("/", userRoutes);
app.use("/pay", paymentRoutes);
app.use("/staff", staffRoutes);
app.use("/admin", adminRoutes);
app.use("/bulk", bulkRoutes);

app.get("/*", (req, res) => {
  res.status(404).send("404 error.");
});

app.listen(port, () => {
  console.log(`server is live on port ${port}`);
});

module.exports = changeStream;
