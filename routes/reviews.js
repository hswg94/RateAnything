const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync.js");
const ExpressError = require("../utils/ExpressError");
const { reviewSchema } = require("../schemas.js");
const Review = require("../models/review");
const review = require("../controllers/reviews");
const { isLoggedIn } = require("../middleware");

const validateReview = catchAsync(async (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
});

const isAuthorized = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (review.author.equals(req.user._id) || req.user.isAdmin) {
    next();
  } else {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/items/${id}`);
  }
};

//Create a new review
router.post("/", isLoggedIn, validateReview, review.createReview);

//Deletes a review
router.delete("/:reviewId", isLoggedIn, isAuthorized, review.destroyReview);

module.exports = router;