const AuthController = require("./auth/auth");
const LinkController = require("./link");
const {sendWelcome, sendGoodbye, sendResetPassword, sendNewLocation} = require("../services/email-sender");

exports.sendWelcomeEmail = async (name, email, lang, wizard, validationToken) => {
    const controlToken = AuthController.generateControlToken(wizard, validationToken);
    const link = LinkController.getUserSignupVerifyLink(controlToken);
    await sendWelcome(name, email, link, lang);
}

exports.sendGoodbyeEmail = async (name, email, lang, wizard, validationToken) => {
    const controlToken = AuthController.generateControlToken(wizard, validationToken);
    const link = LinkController.getUserDeleteVerifyLink(controlToken);
    await sendGoodbye(name, email, link, lang);
}

exports.sendResetPasswordEmail = async (name, email, lang, wizard, validationToken) => {
    const controlToken = AuthController.generateControlToken(wizard, validationToken);
    const link = LinkController.getUserPasswordChangeVerifyLink(controlToken);
    await sendResetPassword(name, email, link, lang);
}

exports.sendNewLocationEmail = async (name, email, lang, wizard, validationToken, location) => {
    const controlToken = AuthController.generateControlToken(wizard, validationToken);
    const link = LinkController.getUserPasswordChangeVerifyLink(controlToken);
    await sendNewLocation(name, email, location, link, lang);
}