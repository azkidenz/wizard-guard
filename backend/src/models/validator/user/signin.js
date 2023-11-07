const {body} = require("express-validator");

exports.userSignInDataValidateChain = [
    body("email")
        .exists({ values: "falsy" })
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Provide valid email"),
    body("password")
        .exists({ values: "falsy" })
        .withMessage("Password is required")
        .isString()
        .withMessage("Password should be string")
        .isHash('sha256')
        .withMessage("Provide valid password")
];