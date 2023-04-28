const BaseJoi = require('joi');
const JoiObjectId = require('joi-objectid');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)
Joi.objectId = JoiObjectId(Joi);

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        images: Joi.array().items(Joi.object({
            url: Joi.string().uri(),
            filename: Joi.string()
        })),
        geometry: Joi.object({
            type: Joi.string().valid('Point').escapeHTML(),
            coordinates: Joi.array().items(Joi.number()).length(2)
        }),
        price: Joi.number().min(0).required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
})