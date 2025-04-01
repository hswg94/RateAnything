require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const mongoose = require("mongoose");
const app = express();
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const campgroundRoutes = require("./routes/items");
const reviewRoutes = require("./routes/reviews");
const flash = require("connect-flash");
const userRoutes = require("./routes/users");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const MongoStore = require("connect-mongo");
const ExpressError = require("./utils/ExpressError.js");
const http = require("http");
const { connectDB } = require('./utils/connectDB.js')
const port = process.env.PORT || 3000;
const cors = require('cors');

const corsOptions = {
  origin: 'https://api.mapbox.com/mapbox-gl-js/v2.13.0/mapbox-gl.css',
};

app.use(cors(corsOptions));

mongoose.set("strictQuery", false);

// Connect to MongoDB
connectDB();

// Create a MongoDB store for session data
const store = MongoStore.create({
  mongoUrl: process.env.DB_URL,
  touchAfter: 24 * 60 * 60, // Update session data only once per day
  crypto: {
    secret: process.env.SESSION_SECRET, // Set a secret for encrypting session data
  },
});

// Handle errors for MongoStore
store.on("error", (e) => {
  console.log("Session Store Error: ", e);
});

// Parse URL-encoded request bodies and populate the `req.body` object
app.use(express.urlencoded({ extended: true }));

// Configure session middleware
const sessionConfig = {
  store,
  name: "session",
  secret: process.env.SESSION_SECRET, // Set a secret for encrypting session data
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    //secure: process.env.NODE_ENV === "production", // Set secure flag if in production
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // Set cookie expiration time to 1 week from now
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

// Set view engine and views directory
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files from public directory
app.use(express.static(__dirname + "/public"));

//// define middleware

// Prevent NoSQL injection attacks by sanitizing user-supplied data
app.use(mongoSanitize());

// Override HTTP methods such as PUT or DELETE using query parameters or headers
app.use(methodOverride("_method"));
// Configure and use the session middleware with the `sessionConfig` object
app.use(session(sessionConfig));
// Flash messages middleware for storing and retrieving messages in session
app.use(flash());
// Initialize Passport authentication middleware
app.use(passport.initialize());
// Use Passport session middleware for persistent authentication across requests
app.use(passport.session());
app.use(helmet({ contentSecurityPolicy: false }));
// Configure Passport to use LocalStrategy for authenticating users
passport.use(new LocalStrategy(User.authenticate()));
// Serialize user data to be stored in session
passport.serializeUser(User.serializeUser());
// Deserialize user data from session
passport.deserializeUser(User.deserializeUser());

//Executed on every page
app.use((req, res, next) => {
  res.locals.currentUrl = req.url;
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", userRoutes);
app.use("/items", campgroundRoutes);
app.use("/items/:id/reviews", reviewRoutes);
app.get("/", (req, res) => {
  res.render("home");
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use((err, req, res, next) => {
  console.error(err.stack);
  let statusCode = err.statusCode || 500;

  if(err.name === 'CastError'){
    statusCode = 400;
  };

  let message = `${statusCode}` + " " + http.STATUS_CODES[statusCode];
  // res.status(statusCode).send(message);
  if (process.env.NODE_ENV !== "production") {
    res.render("error", { message, err });
  } else {
    res.render("error", { message });
  }
});

//error handler middleware
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

//app listener
app.listen(port, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`)
});