const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync.js');
const { validateCampground, getCampground, isLoggedIn, isAuthorized } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });


router.get('/', (campgrounds.index));

router.route('/new')
    //The page to create a new Campground
    .get(isLoggedIn, campgrounds.renderNewForm)

    //Create new Campground
    .post(isLoggedIn,
        upload.array('image'), 
        validateCampground,
        catchAsync(campgrounds.createCG));

router.route('/:id')
    //Display a campground
    .get(getCampground, catchAsync(campgrounds.showCG))
    
    //Delete a campground
    .delete(getCampground, isLoggedIn, isAuthorized, catchAsync(campgrounds.destroyCG));

router.route('/:id/edit')
    //Edit Campground Page
    .get(getCampground, 
        isLoggedIn,
        isAuthorized,
        catchAsync(campgrounds.editCG))

    //Edit a campground
    .put(getCampground, 
        isLoggedIn, 
        isAuthorized,
        upload.array('image'), 
        validateCampground, 
        catchAsync(campgrounds.updateCG));

module.exports = router;