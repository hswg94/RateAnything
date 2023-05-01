const Campground = require('./models/campground.js');
const ExpressError = require('./utils/ExpressError');
const { campgroundSchema } = require('./schemas');
const catchAsync = require('./utils/catchAsync.js');

module.exports.validateCampground = catchAsync(async(req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
});

module.exports.getCampground = catchAsync(async(req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    .populate('author')
    .populate({
        path: 'reviews',
        populate: {
            path: 'author',
            model: 'User'
        }
    });

    if (!campground) {
      req.flash('error', 'Campground not found!');
      return res.redirect('/campgrounds');
    }
    req.campground = campground;
    next();
});

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.flash('error', 'You must be signed in!');
        return res.redirect('/login');
    }
    next();
};

module.exports.isAuthorized = async(req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};