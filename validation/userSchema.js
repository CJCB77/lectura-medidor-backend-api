const joi = require('joi');

const userSchema = joi.object({
    username: joi.string()
                .required()
                .min(4)
                .max(16),
    password: joi.string()
                .min(8)
                .max(16)
                .required(),
    role: joi.number()
})

module.exports = userSchema;