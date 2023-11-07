const { body } = require("express-validator");

exports.postVaultArrayDataValidateChain = [
    body('vault')
        .exists({ values: "falsy" })
        .withMessage("Provide valid vault array")
        .isArray()
        .withMessage("Provide valid vault array"),
    body('vault.*.value')
        .exists({ values: "falsy" })
        .withMessage("Provide valid vault item value")
        .isString()
        .withMessage("Provide valid format item value"),
    body('vault.*.updatedAt')
        .exists({ values: "falsy" })
        .withMessage("Provide valid vault item timestamp")
        .isString()
        .withMessage("Provide valid timestamp string item")
        .isLength({min: 10, max: 13})
        .withMessage("Provide valid timestamp item length (10 or 13)"),
];

exports.putVaultArrayDataValidateChain = [
    body('vault')
        .exists({ values: "falsy" })
        .withMessage("Provide valid vault array")
        .isArray()
        .withMessage("Provide valid vault array"),
    body('vault.*.id')
        .exists({ values: "falsy" })
        .withMessage("Vault item id is required")
        .isMongoId()
        .withMessage("Provide valid format item id"),
    body('vault.*.value')
        .exists({ values: "falsy" })
        .withMessage("Provide valid vault item value")
        .isString()
        .withMessage("Provide valid format item value"),
    body('vault.*.updatedAt')
        .exists({ values: "falsy" })
        .withMessage("Provide valid vault item timestamp")
        .isString()
        .withMessage("Provide valid timestamp string item")
        .isLength({min: 10, max: 13})
        .withMessage("Provide valid timestamp item length (10 or 13)"),
];

exports.deleteVaultArrayDataValidateChain = [
    body('vault')
        .exists({ values: "falsy" })
        .withMessage("Provide valid vault array")
        .isArray()
        .withMessage("Provide valid vault array"),
    body('vault.*')
        .exists({ values: "falsy" })
        .withMessage("Vault item id is required")
        .isMongoId()
        .withMessage("Provide valid format item id")
];
