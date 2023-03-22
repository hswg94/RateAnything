const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync.js');
const { validateCampground, getCampground, isLoggedIn, isAuthorized } = require('../middleware');
const Campground = require('../models/campground.js');

//A home page that shows all campgrounds
router.get('/', async(req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
});

//The page to create a new campground
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});

//Create new campground

router.post('/new', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully created a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.get('/:id', getCampground, async(req, res) => {
    console.log(req.campground);
    res.render('campgrounds/show', { campground: req.campground });
});

//The page to edit a particular campground
router.get('/:id/edit', getCampground, isLoggedIn, isAuthorized,  async(req, res) => {
    res.render('campgrounds/edit', { campground: req.campground });
});


//Edit a campground
router.put('/:id/', getCampground, isLoggedIn, isAuthorized, validateCampground, async(req, res) => {
    await req.campground.update({...req.body.campground});
    req.flash('success', 'Campground Updated');
    res.redirect(`/campgrounds/${req.campground._id}`);
});

//Delete a campground
router.delete('/:id', getCampground, isLoggedIn, isAuthorized, async(req, res) => {
    await req.campground.remove();
    req.flash('success', 'Campground Deleted!');
    res.redirect('/campgrounds');
  });

module.exports = router;