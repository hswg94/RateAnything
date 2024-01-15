const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

module.exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username, isAdmin: false });
        const registeredUser = await User.register(user, password);
        // Log in the user after successful registration
        await req.login(registeredUser, (err) => {
            if (err) {
                req.flash('There was an error logging you in, please try again!', err.message);
                return res.redirect('/register');
            }
            req.flash('success', 'Registration Successful!');
            res.redirect('/');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
};

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
};

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome Back!');
    res.redirect('/items');
};

module.exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success', "Successfully Logged Out!");
        res.redirect('/');
    });
};