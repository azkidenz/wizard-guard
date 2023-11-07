const { body } = require("express-validator");

exports.getDeleteVaultOneDataValidateChain = [
    body('id')
        .exists({ values: "falsy" })
        .withMessage("Vault id is required")
        .isMongoId()
        .withMessage("Provide valid format id")
];

exports.postVaultOneDataValidateChain = [
    body('value')
        .exists({ values: "falsy" })
        .withMessage("Provide valid vault value")
        .isString()
        .withMessage("Provide valid format value"),
    body('updatedAt')
        .exists({ values: "falsy" })
        .withMessage("Provide valid vault timestamp")
        .isString()
        .withMessage("Provide valid timestamp string")
        .isLength({min: 10, max: 13})
        .withMessage("Provide valid timestamp length (10 or 13)"),
];

exports.putVaultOneDataValidateChain = [
    body('id')
        .exists({ values: "falsy" })
        .withMessage("Vault id is required")
        .isMongoId()
        .withMessage("Provide valid format id"),
    body('value')
        .exists({ values: "falsy" })
        .withMessage("Provide valid vault value")
        .isString()
        .withMessage("Provide valid format value"),
    body('updatedAt')
        .exists({ values: "falsy" })
        .withMessage("Provide valid vault timestamp")
        .isString()
        .withMessage("Provide valid timestamp string")
        .isLength({min: 10, max: 13})
        .withMessage("Provide valid timestamp length (10 or 13)"),
];