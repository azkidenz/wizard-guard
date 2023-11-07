const {body} = require("express-validator");

exports.userDeleteVerifyDataValidateChain = [
    body("token")
        .exists({ values: "falsy" })
        .withMessage("Token is required")
        .isString()
        .withMessage("Token should be string")
        .isJWT()
        .withMessage("Provide valid token"),
    body("password")
        .exists({ values: "falsy" })
        .withMessage("Password is required")
        .isString()
        .withMessage("Password should be string")
        .isHash('sha256')
        .withMessage("Provide valid password")
];
