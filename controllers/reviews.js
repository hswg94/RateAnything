const Campground = require("../models/campground.js");
const Review = require("../models/review");
const catchAsync = require("../utils/catchAsync.js");

module.exports.createReview = catchAsync(async (req, res, next) => {
  const campground = await Campground.findById(req.params.id).populate(
    "reviews"
  );
  const review = new Review(req.body.review);
  review.author = req.user._id;
  campground.reviews.push(review);
  await review.save();

  if (campground.reviews.length) {
    let totalrating = 0;
    for (const review of campground.reviews) {
      totalrating += review.rating;
    }
    campground.rating = totalrating / campground.reviews.length;
  } else {
    campground.rating = 0;
  }
  await campground.save();

  req.flash("success", "Your review has been created successfully!");
  res.redirect(`/items/${campground._id}`);
});

module.exports.destroyReview = catchAsync(async (req, res) => {
  await Review.findByIdAndDelete(req.params.reviewId);
  const campground = await Campground.findById(req.params.id).populate(
    "reviews"
  );
  await campground.updateOne({ $pull: { reviews: req.params.reviewId } });

  if (campground.reviews.length) {
    let totalrating = 0;
    for (const review of campground.reviews) {
      totalrating += review.rating;
    }
    campground.rating = totalrating / campground.reviews.length;
  } else {
    campground.rating = 0;
  }
  await campground.save();

  req.flash("success", "Review Deleted!");
  res.redirect(`/items/${req.params.id}`);
});
