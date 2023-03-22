const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync.js');
const { validateCampground, getCampground, isLoggedIn, isAuthorized } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');

router.get('/', (campgrounds.index));

//The page to create a new campground
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

//Create new campground

router.post('/new', isLoggedIn, validateCampground, catchAsync(campgrounds.createCG));

router.get('/:id', getCampground, catchAsync(campgrounds.showCG));

//The page to edit a particular campground
router.get('/:id/edit',
    getCampground, 
    isLoggedIn,
    isAuthorized,
    catchAsync(campgrounds.editCG));

//Edit a campground
router.put('/:id/', getCampground, isLoggedIn, isAuthorized, validateCampground, catchAsync(campgrounds.updateCG));

//Delete a campground
router.delete('/:id', getCampground, isLoggedIn, isAuthorized, catchAsync(campgrounds.destroyCG));

module.exports = router;