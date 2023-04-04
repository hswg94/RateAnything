const express = require('express');
const cities = require('./cities');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const Campground = require('../models/campground');
const {places, descriptors} = require('./seedHelpers');
const { isNull } = require('util');

db = mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
.then(() => {
    console.log("Connection OPEN!!!");
})
.catch(err => {
    console.log("Connection ERROR!!!");
    console.log(err);
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dvip6hzwl/image/upload/v1680002013/cld-sample-2.jpg',
                    filename: 'mountains'
                },
            ],
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude, 
                    cities[random1000].latitude
                ]
            },
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Fugit, reiciendis asperiores odit unde consequatur laudantium. Vel eaque vero mollitia, minus explicabo ut libero commodi nulla in sint odio ab aspernatur!',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            author: '6412c31c18b930abf7b8be6e',
        });
        await camp.save();
    };
};

seedDB().then(() => {
    mongoose.connection.close();
});