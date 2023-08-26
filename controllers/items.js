//A home page that shows all campgrounds
const Campground = require('../models/campground.js');
const Review = require('../models/review.js');
const express = require('express');
const router = express.Router({ mergeParams: true });
const { cloudinary } = require('../cloudinary/index.js');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding.js");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const catchAsync = require('../utils/catchAsync.js');


module.exports.index = router.get('/', catchAsync(async(req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.createCG = catchAsync(async(req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()

    const campground = new Campground(req.body.campground);
    if (geoData.body.features.length > 0) {
        campground.geometry = geoData.body.features[0].geometry;
    }
    campground.images = req.files.map(f => ({
        url: f.path,
        filename: f.filename
    }));
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully created a new campground!');
    res.redirect(`/items/${campground._id}`);
});

module.exports.showCG = async(req, res) => {
    res.render('campgrounds/show', { campground: req.campground });
};

module.exports.editCG = async(req, res) => {
    res.render('campgrounds/edit', { campground: req.campground });
};

module.exports.updateCG = catchAsync(async(req, res) => {
    await req.campground.update({...req.body.campground});
    const imgs = req.files.map(f => ({
        url: f.path,
        filename: f.filename
    }));

    req.campground.images.push(...imgs);
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await req.campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
    }

    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    if (geoData.body.features.length > 0) {
        req.campground.geometry = geoData.body.features[0].geometry;
    }
    await req.campground.save();
    req.flash('success', 'Campground Updated');
    res.redirect(`/items/${req.campground._id}`);
});

module.exports.destroyCG = catchAsync(async(req, res) => {
    const { id } = req.params;
    await Review.deleteMany({ campground: id });
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground Deleted!');
    res.redirect('/items');
});