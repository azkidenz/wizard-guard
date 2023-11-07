const Exception = require("../controllers/exception");
const SessionController = require("../controllers/session");
const express = require('express');
const {authenticateToken} = require("../controllers/auth/verify");
const {validationResult} = require("express-validator");
const Fail = require("../controllers/fail");
const ResponseController = require("../controllers/response");
const SessionModel = require("../models/session");
const {allSessionsDeleteDataValidateChain, oneSessionDeleteDataValidateChain} = require("../models/validator/sessions");
const response = new ResponseController();
let fail;


const router = express.Router();

router.get('/', authenticateToken, async (req, res, next) => {
    try {
        const data = await SessionController.getAllSessions(req.auth.wizard, req.auth.session);
        if(!data)
            return next(new Exception(110));
        response.setSuccess(data);
        res.status(response.getHttpCode()).json(response.getResponse());
    } catch (error) {
        next(error);
    }
});

router.delete('/', [authenticateToken, allSessionsDeleteDataValidateChain], async (req, res, next) => {
    try {
        if (!(fail = validationResult(req)).isEmpty())
            next(new Fail(fail.array()));
        const data = await SessionController.clearSessions(req.auth.wizard, req.auth.session, (req.body.current === 'true'));
        if(!data)
            return next(new Exception(110));
        response.setSuccess();
        res.status(response.getHttpCode()).json(response.getResponse());
    } catch (error) {
        next(error);
    }
});

router.delete('/one', [authenticateToken, oneSessionDeleteDataValidateChain], async (req, res, next) => {
    try {
        if (!(fail = validationResult(req)).isEmpty())
            next(new Fail(fail.array()));
        if(!await SessionModel.popSession(req.auth.wizard, req.body.id))
            return next(new Exception(111));
        response.setSuccess(req.body);
        res.status(response.getHttpCode()).json(response.getResponse());
    } catch (error) {
        next(error);
    }
});

module.exports = router;