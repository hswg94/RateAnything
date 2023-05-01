const express = require('express');
const router = express.Router({ mergeParams: true });

const { setAuthor, validateCampground, getCampground, isLoggedIn, isAuthorized } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });


router.get('/', (campgrounds.index));

router.route('/new')
    //The page to create a new Campground
    .get(isLoggedIn, 
        campgrounds.renderNewForm
    )

    //Create new Campground
    .post(isLoggedIn,
        upload.array('image'), 
        validateCampground, 
        campgrounds.createCG
    );

    
router.route('/:id')
    //Display a campground
    .get(getCampground, 
        campgrounds.showCG
    );

router.route('/:id/delete')
    //Delete a campground
    .delete(getCampground, 
            isLoggedIn, 
            isAuthorized, 
            campgrounds.destroyCG
    );

router.route('/:id/edit')
    //Edit Campground Page
    .get(getCampground, 
        isLoggedIn,
        isAuthorized,
        campgrounds.editCG
    )

    //Edit a campground
    .put(getCampground, 
        isLoggedIn, 
        isAuthorized,
        upload.array('image'), 
        validateCampground, 
        campgrounds.updateCG
    );

module.exports = router;