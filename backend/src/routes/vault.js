const express = require('express');
const {validationResult} = require("express-validator");
const Exception = require("../controllers/exception");
const Fail = require("../controllers/fail");
const router = express.Router();
const {authenticateToken} = require('../controllers/auth/verify');
const ResponseController = require("../controllers/response");
const VaultModel = require("../models/vault");
const {postVaultArrayDataValidateChain, putVaultArrayDataValidateChain, deleteVaultArrayDataValidateChain} = require("../models/validator/vault/array");
const VaultController = require("../controllers/vault");
const {getDeleteVaultOneDataValidateChain, putVaultOneDataValidateChain, postVaultOneDataValidateChain} = require("../models/validator/vault/one");
const response = new ResponseController();
let fail;

router.get('/', authenticateToken, async (req, res, next) => {
    try {
        const vault = await VaultController.getVault(req.auth.wizard);
        response.setSuccess(vault)
        res.status(response.getHttpCode()).json(response.getResponse());
    } catch (error) {
        next(error);
    }
});

router.post('/', [authenticateToken, postVaultArrayDataValidateChain], async (req, res, next) => {
    try {
        if (!(fail = validationResult(req)).isEmpty())
            return next(new Fail(fail.array()));
        const ids = await VaultController.pushManyVaultItems(req.auth.wizard, req.body.vault);
        if(!ids)
            return next(new Exception(113));
        response.setSuccess({vault: ids})
        res.status(response.getHttpCode()).json(response.getResponse());
    } catch (error) {
        next(error);
    }
});

router.put('/', [authenticateToken, putVaultArrayDataValidateChain], async (req, res, next) => {
    try {
        if (!(fail = validationResult(req)).isEmpty())
            return next(new Fail(fail.array()));
        const flag = await VaultController.updateManyVaultItems(req.auth.wizard, req.body.vault);
        if(!flag)
            return next(new Exception(113));
        response.setSuccess(req.body)
        res.status(response.getHttpCode()).json(response.getResponse());
    } catch (error) {
        next(error);
    }
});

router.delete('/', [authenticateToken, deleteVaultArrayDataValidateChain], async (req, res, next) => {
    try {
        if (!(fail = validationResult(req)).isEmpty())
            return next(new Fail(fail.array()));
        const flag = await VaultController.deleteManyVaultItems(req.auth.wizard, req.body.vault);
        if(!flag)
            return next(new Exception(113));
        response.setSuccess(req.body);
        res.status(response.getHttpCode()).json(response.getResponse());
    } catch (error) {
        next(error);
    }
});

router.get('/one', [authenticateToken, getDeleteVaultOneDataValidateChain], async (req, res, next) => {
    try {
        if (!(fail = validationResult(req)).isEmpty())
            return next(new Fail(fail.array()));
        const one = await VaultModel.getVaultItemById(req.auth.wizard, req.body.id);
        response.setSuccess(one.vault)
        res.status(response.getHttpCode()).json(response.getResponse());
    } catch (error) {
        next(error);
    }
});

router.post('/one', [authenticateToken, postVaultOneDataValidateChain], async (req, res, next) => {
    try {
        if (!(fail = validationResult(req)).isEmpty())
            return next(new Fail(fail.array()));
        const id = await VaultController.pushOneVaultItem(req.auth.wizard, req.body);
        if(!id)
            return next(new Exception(113));
        response.setSuccess({id: id})
        res.status(response.getHttpCode()).json(response.getResponse());
    } catch (error) {
        next(error);
    }
});

router.put('/one', [authenticateToken, putVaultOneDataValidateChain], async (req, res, next) => {
    try {
        if (!(fail = validationResult(req)).isEmpty())
            return next(new Fail(fail.array()));
        const flag = await VaultModel.updateVaultItem(req.auth.wizard, req.body);
        if(!flag)
            return next(new Exception(113));
        response.setSuccess(req.body)
        res.status(response.getHttpCode()).json(response.getResponse());
    } catch (error) {
        next(error);
    }
});

router.delete('/one', [authenticateToken, getDeleteVaultOneDataValidateChain], async (req, res, next) => {
    try {
        if (!(fail = validationResult(req)).isEmpty())
            return next(new Fail(fail.array()));
        const flag = await VaultModel.deleteVaultItem(req.auth.wizard, req.body.id);
        if(!flag)
            return next(new Exception(116));
        response.setSuccess(req.body);
        res.status(response.getHttpCode()).json(response.getResponse());
    } catch (error) {
        next(error);
    }
});



module.exports = router;