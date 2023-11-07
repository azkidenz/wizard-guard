const express = require('express');
const SessionModel = require("../models/session");
const Exception = require("../controllers/exception");
const SessionController = require("../controllers/session");
const AuthController = require("../controllers/auth/auth");
const ResponseController = require("../controllers/response");
const {authRefreshTokenVerifyDataValidateChain} = require("../models/validator/auth");
const TokenController = require("../controllers/auth/token");
const router = express.Router();
const response = new ResponseController();

router.post('/refreshTokens', authRefreshTokenVerifyDataValidateChain, async (req, res, next) => {
    try {
        const auth = TokenController.verifyRefreshToken(req.body.refreshToken);
        if(!auth)
            return next(new Exception(106));
        const verify = await SessionController.verifyRefreshToken(auth.wizard, auth.session, req.body.refreshToken);
        if(!verify)
            return next(new Exception(106));
        if(!await SessionModel.popSession(auth.wizard, auth.session))
            next(new Exception(106));
        const sessionId = SessionController.generateSessionId();
        const tokens = AuthController.generateTokens(auth.wizard, auth.user, sessionId);
        await SessionController.pushSession(auth.wizard, sessionId, req.ip, req.useragent, tokens.refreshToken);
        response.setSuccess(tokens);
        res.status(response.getHttpCode()).json(response.getResponse());
    } catch (error) {
        next(error);
    }
});

module.exports = router;