const express = require('express');
const MagicController = require('../controllers/magic');
const MagicModel = require("../models/magic");
const {authenticateToken} = require("../controllers/auth/verify");
const {magicDataValidateChain} = require("../models/validator/magic");
const {validationResult} = require("express-validator");
const Fail = require("../controllers/fail");
const ResponseController = require("../controllers/response");
const SessionModel = require("../models/session");
const Exception = require("../controllers/exception");
const response = new ResponseController();
let fail;

const router = express.Router();

router.post('/', [authenticateToken, magicDataValidateChain], async (req, res, next) => {
    try {
        if (!(fail = validationResult(req)).isEmpty())
            next(new Fail(fail.array()));
        if(await MagicController.isEmpty(req.auth.wizard))
            await SessionModel.clearSessions(req.auth.wizard);
        await MagicModel.setMagicKey(req.auth.wizard, req.body.magicKey);
        response.setSuccess();
        res.status(201).json(response.getResponse());
    } catch (error) {
        next(error);
    }
});

router.get('/', authenticateToken, async (req, res, next) => {
    try {
        if(await MagicController.isEmpty(req.auth.wizard))
            return next(new Exception(114));
        const magic = await MagicModel.getMagicKey(req.auth.wizard);
        response.setSuccess(magic);
        res.status(response.getHttpCode()).json(response.getResponse());
    }
    catch (error) {
        next(error);
    }
});

module.exports = router;