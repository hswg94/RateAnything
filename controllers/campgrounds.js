//A home page that shows all campgrounds
const Campground = require('../models/campground.js');
const express = require('express');
const router = express.Router({ mergeParams: true });

module.exports.index = router.get('/', async(req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
});

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.createCG = async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully created a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCG = async(req, res) => {
    res.render('campgrounds/show', { campground: req.campground });
}

module.exports.editCG = async(req, res) => {
    res.render('campgrounds/edit', { campground: req.campground });
}

module.exports.updateCG = async(req, res) => {
    await req.campground.update({...req.body.campground});
    req.flash('success', 'Campground Updated');
    res.redirect(`/campgrounds/${req.campground._id}`);
}

module.exports.destroyCG = async(req, res) => {
    await req.campground.remove();
    req.flash('success', 'Campground Deleted!');
    res.redirect('/campgrounds');
  }