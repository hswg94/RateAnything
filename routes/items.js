const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  setAuthor,
  validateCampground,
  getCampground,
  isLoggedIn,
  isAuthorized,
} = require("../middleware");
const campgrounds = require("../controllers/items");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });
const Campground = require("../models/campground.js");

router.get("/", campgrounds.index);

router
  .route("/new")
  //The page to create a new listing
  .get(isLoggedIn, campgrounds.renderNewForm)

  //Create listing
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    campgrounds.createCG
  );

router
  .route("/:id")
  //Display listing
  .get(getCampground, campgrounds.showCG);

router
  .route("/:id/delete")
  //Delete listing
  .delete(getCampground, isLoggedIn, isAuthorized, campgrounds.destroyCG);

router
  .route("/:id/edit")
  //Retrieve listing
  .get(getCampground, isLoggedIn, isAuthorized, campgrounds.editCG)

  //Edit listing
  .put(
    getCampground,
    isLoggedIn,
    isAuthorized,
    upload.array("image"),
    validateCampground,
    campgrounds.updateCG
  );

module.exports = router;

