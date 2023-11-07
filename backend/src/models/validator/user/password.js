const {body} = require("express-validator");

exports.userPasswordResetDataValidateChain = [
    body("password")
        .exists({ values: "falsy" })
        .withMessage("Password is required")
        .isString()
        .withMessage("Password should be string")
        .isHash('sha256')
        .withMessage("Provide valid password")
];

exports.userPasswordEditDataValidateChain = [
    body("token")
        .exists({ values: "falsy" })
        .withMessage("Token is required")
        .isString()
        .withMessage("Token should be string")
        .isJWT()
        .withMessage("Provide valid token"),
    body("oldPassword")
        .exists({ values: "falsy" })
        .withMessage("Old password is required")
        .isString()
        .withMessage("Old password should be string")
        .isHash('sha256')
        .withMessage("Provide valid old password"),
    body("newPassword")
        .exists({ values: "falsy" })
        .withMessage("New password is required")
        .isString()
        .withMessage("New password should be string")
        .isHash('sha256')
        .withMessage("Provide valid new password")
];