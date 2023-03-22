const Campground = require('../models/campground.js');
const Review = require('../models/review');

module.exports.createReview = async(req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.destroyReview = async(req, res) => {
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success', 'Review Deleted!');
    res.redirect(`/campgrounds/${req.params.id}`)
}