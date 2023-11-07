const { body } = require("express-validator");

exports.authRefreshTokenVerifyDataValidateChain = [
    body("refreshToken")
        .exists({ values: "falsy" })
        .withMessage("Refresh Token code is required")
        .isString()
        .withMessage("Refresh Token code should be string")
        .isJWT()
        .withMessage("Refresh Token has invalid format")
];