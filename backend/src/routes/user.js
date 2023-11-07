const express = require('express');
const UserModel = require('../models/user');
const UserController = require('../controllers/user');
const MagicController = require('../controllers/magic');
const ResponseController = require('../controllers/response');
const {validationResult} = require("express-validator");
const Exception = require("../controllers/exception");
const Fail = require("../controllers/fail");
const router = express.Router();
const {userSignUpDataValidateChain, userSignUpVerifyDataValidateChain} = require('../models/validator/user/signup')
const {userSignInDataValidateChain} = require('../models/validator/user/signin')
const {authenticateToken, verifyControlToken} = require('../controllers/auth/verify');
const SessionController = require("../controllers/session");
const AuthController = require("../controllers/auth/auth");
const SessionModel = require("../models/session");
const {userProfileDataValidateChain} = require("../models/validator/user/profile");
const {userDeleteVerifyDataValidateChain} = require("../models/validator/user/delete");
const {userPasswordResetDataValidateChain, userPasswordEditDataValidateChain} = require("../models/validator/user/password");
const {acceptedLanguages} = require("../config");
const EmailController = require("../controllers/email");
const {getLocationByIp} = require("../services/ip2location");
const response = new ResponseController();
let fail, lang;

router.post('/signup', userSignUpDataValidateChain, async (req, res, next) => {
    try {
        if (!(fail = validationResult(req)).isEmpty())
            return next(new Fail(fail.array()));
        const userData = UserController.signup(req.body);
        const magicKey = MagicController.empty();
        const wizard = await UserModel.createUser(userData, magicKey);
        const session = SessionController.generateSessionId();
        const tokens = AuthController.generateTokens(wizard, req.body.email, session);
        await SessionController.pushSession(wizard, session, req.ip, req.useragent, tokens.refreshToken);
        lang = req.acceptsLanguages(acceptedLanguages);
        await EmailController.sendWelcomeEmail(userData.name, req.body.email, lang, wizard, userData.validationToken);
        response.setSuccess(tokens)
        res.status(201).json(response.getResponse());
    } catch (error) {
        next(error);
    }
});

router.post('/signup/verify', userSignUpVerifyDataValidateChain, async (req, res, next) => {
    try {
        if (!(fail = validationResult(req)).isEmpty())
            return next(new Fail(fail.array()));
        const wizard = await verifyControlToken(req.body.token);
        if(!wizard)
            return next(new Exception(104));
        const activeUserFlag = await UserController.activateUser(wizard);
        if(!activeUserFlag)
            return next(new Exception(104));
        response.setSuccess();
        res.status(response.getHttpCode()).json(response.getResponse());
    } catch (error) {
        next(error);
    }
});

router.post('/signin', userSignInDataValidateChain, async (req, res , next) => {
    try {
        if (!(fail = validationResult(req)).isEmpty())
            return next(new Fail(fail.array()));
        const user = await UserController.signin(req.body.email, req.body.password);
        if(!user)
            return next(new Exception(107));
        if(!user.isActive)
            return next(new Exception(115));
        const sessionId = SessionController.generateSessionId();
        const tokens = AuthController.generateTokens(user.wizard, req.body.email, sessionId);
        await SessionController.pushSession(user.wizard, sessionId, req.ip, req.useragent, tokens.refreshToken);
        const data = ResponseController.concatTwo({name: user.name}, tokens);
        response.setSuccess(data);
        const location = getLocationByIp(req.ip);
        if(await SessionModel.isNewCountry(user.wizard, location.iso)) {
            lang = req.acceptsLanguages(acceptedLanguages);
            await EmailController.sendNewLocationEmail(user.name, req.body.email, lang, user.wizard, user.validationToken, location.ext);
        }
        res.status(response.getHttpCode()).json(response.getResponse());
    } catch (error) {
        next(error);
    }
});

router.post('/signout', authenticateToken, async (req, res , next) => {
    try {
        if(!await SessionModel.popSession(req.auth.wizard, req.auth.session))
            return next(new Exception(106));
        response.setSuccess();
        res.status(response.getHttpCode()).json(response.getResponse());
    } catch (error) {
        next(error);
    }
});

router.get('/profile', authenticateToken, async (req, res , next) => {
    try {
        const data = await UserModel.getUser(req.auth.wizard);
        if(!data)
            return next(new Exception(108));
        response.setSuccess(data.user);
        res.status(response.getHttpCode()).json(response.getResponse());
    } catch (error) {
        next(error);
    }
});

router.put('/profile', [authenticateToken, userProfileDataValidateChain], async (req, res , next) => {
    try {
        if (!(fail = validationResult(req)).isEmpty())
            return next(new Fail(fail.array()));
        if(!await UserController.editProfile(req.auth.wizard, req.body))
            return next(new Exception(109));
        response.setSuccess(req.body);
        res.status(response.getHttpCode()).json(response.getResponse());
    } catch (error) {
        next(error);
    }
});

router.post('/delete', authenticateToken, async (req, res , next) => {
    try {
        const userData = await UserModel.getUser(req.auth.wizard, true);
        lang = req.acceptsLanguages(acceptedLanguages);
        await EmailController.sendGoodbyeEmail(userData.user.name, userData.user.email, lang, req.auth.wizard, userData.user.validationToken);
        response.setSuccess();
        res.status(response.getHttpCode()).json(response.getResponse());
    } catch (error) {
        next(error);
    }
});

router.delete('/delete/verify', userDeleteVerifyDataValidateChain, async (req, res , next) => {
    try {
        if (!(fail = validationResult(req)).isEmpty())
            return next(new Fail(fail.array()));
        const wizard = await verifyControlToken(req.body.token);
        if(!wizard)
            return next(new Exception(104));
        if(!await UserController.deleteUser(wizard, req.body.password))
            return next(new Exception(116));
        response.setSuccess();
        res.status(response.getHttpCode()).json(response.getResponse());
    } catch (error) {
        next(error);
    }
});

router.post('/password/reset', [authenticateToken, userPasswordResetDataValidateChain], async (req, res , next) => {
    try {
        if (!(fail = validationResult(req)).isEmpty())
            return next(new Fail(fail.array()));
        const user = await UserController.signin(req.auth.user, req.body.password);
        if(!user || !user.isActive)
            return next(new Exception(107));
        const userData = await UserModel.getUser(req.auth.wizard, true);
        lang = req.acceptsLanguages(acceptedLanguages);
        await EmailController.sendResetPasswordEmail(userData.user.name, userData.user.email, lang, req.auth.wizard, userData.user.validationToken);
        response.setSuccess();
        res.status(response.getHttpCode()).json(response.getResponse());
    } catch (error) {
        next(error);
    }
});

router.put('/password/edit', userPasswordEditDataValidateChain, async (req, res , next) => {
    try {
        if (!(fail = validationResult(req)).isEmpty())
            return next(new Fail(fail.array()));
        const wizard = await verifyControlToken(req.body.token);
        if(!wizard)
            return next(new Exception(104));
        if(!await UserController.changeUserPassword(wizard, req.body.oldPassword, req.body.newPassword))
            return next(new Exception(116));
        response.setSuccess();
        res.status(response.getHttpCode()).json(response.getResponse());
    } catch (error) {
        next(error);
    }
});

module.exports = router;