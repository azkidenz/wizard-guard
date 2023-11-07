const Crypto = require("../services/crypto");
const UserModel = require("../models/user");

const getNewMasterPassword = (password) => {
    const salt = Crypto.generateRandomSalt();
    const pass = Crypto.generateMasterPasswordHashHash(password, salt);
    return {salt: salt, value: pass};
}

exports.signup = (req) => {
    const password = getNewMasterPassword(req.password);
    return {
        name: {
            firstName: req.name.firstName,
            lastName: req.name.lastName
        },
        email: req.email,
        masterPassword: {
            value: password.value,
            salt: password.salt
        },
        validationToken: Crypto.generateRandomSalt(32)
    };
};

exports.activateUser = async (wizard) => {
    return await UserModel.setUserAsActiveById(wizard) ?? false;
}

exports.updateUserToken = async (wizard) => {
    const newToken = Crypto.generateRandomSalt(32);
    return await UserModel.updateUserToken(wizard, newToken);
}

exports.signin = async (email, password) => {
    const wizard = await UserModel.findUserByEmail(email, true, true, true);
    if(wizard)
        if(Crypto.verifyMasterPasswordHash(password, wizard.user.masterPassword.salt, wizard.user.masterPassword.value))
            return {wizard: wizard._id, name: wizard.user.name, isActive: wizard.user.isActive, validationToken: wizard.user.validationToken};
    return false;
}

exports.editProfile = async (wizard, data) => {
    return await UserModel.editProfile(wizard, data.name);
}

const checkUser = async (wizard, password) => {
    const data = await UserModel.findUserById(wizard, true, true);
    if(data)
        if(Crypto.verifyMasterPasswordHash(password, data.user.masterPassword.salt, data.user.masterPassword.value))
            if(data.user.isActive)
                return true;
    return false;
}

exports.deleteUser = async (wizard, password) => {
    if(!await checkUser(wizard, password))
        return false;
    return await UserModel.deleteUser(wizard);
}

exports.changeUserPassword = async (wizard, oldPassword, newPassword) => {
    if(!await checkUser(wizard, oldPassword))
        return false;
    const newMasterPassword = getNewMasterPassword(newPassword);
    return await UserModel.editMasterPassword(wizard, newMasterPassword) ?? false;
}