const { body } = require("express-validator");

exports.allSessionsDeleteDataValidateChain = [
    body("current")
        .exists({ values: "falsy" })
        .withMessage("Provide valid current option")
        .isBoolean()
        .withMessage("Current option should be bool")
];

exports.oneSessionDeleteDataValidateChain = [
    body("id")
        .exists({ values: "falsy" })
        .withMessage("Provide valid id")
        .isMongoId()
        .withMessage("Provide valid format id")
];