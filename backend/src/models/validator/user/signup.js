const { body } = require("express-validator");

exports.userSignUpDataValidateChain = [
    body("name.firstName")
        .exists({ values: "falsy" })
        .withMessage("User first name is required")
        .isString()
        .withMessage("User first name should be string"),
    body("name.lastName")
        .exists({ values: "falsy" })
        .withMessage("User last name is required")
        .isString()
        .withMessage("User last name should be string"),
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

exports.userSignUpVerifyDataValidateChain = [
    body("token")
        .exists({ values: "falsy" })
        .withMessage("Token is required")
        .isString()
        .withMessage("Token should be string")
        .isJWT()
        .withMessage("Provide valid token")
];
