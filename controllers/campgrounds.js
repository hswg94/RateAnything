//A home page that shows all campgrounds
const Campground = require('../models/campground.js');
const express = require('express');
const router = express.Router({ mergeParams: true });
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding.js");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });


module.exports.index = router.get('/', async(req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
});

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.createCG = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()

    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({
        url: f.path,
        filename: f.filename
    }));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully created a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCG = async(req, res) => {
    res.render('campgrounds/show', { campground: req.campground });
};

module.exports.editCG = async(req, res) => {
    res.render('campgrounds/edit', { campground: req.campground });
};

module.exports.updateCG = async(req, res) => {
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
    await req.campground.save();
    req.flash('success', 'Campground Updated');
    res.redirect(`/campgrounds/${req.campground._id}`);
};

module.exports.destroyCG = async(req, res) => {
    await req.campground.remove();
    req.flash('success', 'Campground Deleted!');
    res.redirect('/campgrounds');
};