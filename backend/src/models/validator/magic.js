const { body } = require("express-validator");

exports.magicDataValidateChain = [
    body("magicKey")
        .exists({ values: "falsy" })
        .withMessage("Provide valid magic key")
        .isString()
        .withMessage("Magic key should be string")
        .isLength({min: 192, max: 192})
        .withMessage("Provide valid magic key length")
];