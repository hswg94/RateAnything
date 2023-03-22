const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync.js');
const ExpressError = require('../utils/ExpressError');
const { reviewSchema } = require('../schemas.js');
const Campground = require('../models/campground.js');
const Review = require('../models/review');
const { isLoggedIn } = require('../middleware');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
};


const isAuthorized = async(req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

//Create a new review
router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

//Deletes a review
router.delete('/:reviewId', isLoggedIn, isAuthorized, catchAsync(async(req, res) => {
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success', 'Review Deleted!');
    res.redirect(`/campgrounds/${req.params.id}`)
}));

module.exports = router;