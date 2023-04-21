if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
};

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const session = require('express-session');
const flash = require('connect-flash');
const userRoutes = require('./routes/users');
const mongoSanitize = require('express-mongo-sanitize');


mongoose.set('strictQuery', false);
db = mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => {
        console.log("Connection OPEN!!!");
    })
    .catch(err => {
        console.log("Connection ERROR!!!");
        console.log(err);
    });
;

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/public'));


//// define middleware

// prevent NoSQL injection attacks by sanitizing user-supplied data
app.use(mongoSanitize());
// Parse URL-encoded request bodies and populate the `req.body` object
app.use(express.urlencoded({ extended: true }));
// Override HTTP methods such as PUT or DELETE using query parameters or headers
app.use(methodOverride('_method'));
// Configure and use the session middleware with the `sessionConfig` object
app.use(session(sessionConfig));
// Flash messages middleware for storing and retrieving messages in session
app.use(flash());
// Initialize Passport authentication middleware
app.use(passport.initialize());
// Use Passport session middleware for persistent authentication across requests
app.use(passport.session());
// Configure Passport to use LocalStrategy for authenticating users
passport.use(new LocalStrategy(User.authenticate()));
// Serialize user data to be stored in session
passport.serializeUser(User.serializeUser());
// Deserialize user data from session
passport.deserializeUser(User.deserializeUser());

//executes on every page, and can be used on every ejs
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use('/', userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get('/', (req, res) => {
    res.render('home');
});

app.listen(3000, () => {
    console.log("Port 3000 Initialized");
});