const Campground = require('../models/campground.js');
const Review = require('../models/review');
const catchAsync = require('../utils/catchAsync.js');

module.exports.createReview = catchAsync(async(req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/items/${campground._id}`);
});

module.exports.destroyReview = catchAsync(async(req, res) => {
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success', 'Review Deleted!');
    res.redirect(`/items/${req.params.id}`)
});