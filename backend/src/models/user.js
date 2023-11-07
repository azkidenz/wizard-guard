const WizardModel = require('./wizard');

exports.createUser = async (userData, magicKey) => {
    const c = {
        user: userData,
        magicKey: magicKey,
        sessions: [],
        vault: []
    };
    const wiz = new WizardModel(c);
    await wiz.save();
    return wiz._id.toString();
}

exports.setUserAsActiveById = async (wizard) => {
    return await WizardModel.findByIdAndUpdate(wizard, {"user.isActive": true}).exec() ?? false;
}

exports.isUserActiveById = async (wizard) => {
    return await WizardModel.findById(wizard, "user.isActive").exec() ?? false;
}

exports.findUserByEmail = async (email, getMasterPassword = false, getIsActive = false, getValidationToken = false) => {
    const arg = {"_id": 1, "user.name": 1};
    if(getMasterPassword)
        arg["user.masterPassword"] = 1;
    if(getIsActive)
        arg["user.isActive"] = 1;
    if(getValidationToken)
        arg["user.validationToken"] = 1;
    return await WizardModel.findOne({"user.email": email}).select(arg).exec() ?? false;
}

exports.findUserById = async (id, getMasterPassword = false, getIsActive = false) => {
    const arg = {"user.email": 1, "user.name": 1};
    if(getMasterPassword)
        arg["user.masterPassword"] = 1;
    if(getIsActive)
        arg["user.isActive"] = 1;
    return await WizardModel.findOne({"_id": id}).select(arg).exec() ?? false;
}

exports.updateUserToken = async (wizard, newToken) => {
    return await WizardModel.findByIdAndUpdate(wizard, {"user.validationToken": newToken}).exec() ?? false;
}

exports.getUser = async (wizard, getToken = false) => {
    let request = "-_id user.name user.email";
    if(getToken)
        request += " user.validationToken";
    return await WizardModel.findById(wizard, request).exec() ?? false;
}

exports.getUserToken = async (wizard) => {
    return await WizardModel.findById(wizard, "user.validationToken").exec() ?? false;
}

exports.verifyUserTokenById = async (wizard, token) => {
    const userToken = await this.getUserToken(wizard);
    if(!userToken)
        return false;
    return userToken.user.validationToken === token;
}

exports.editProfile = async (wizard, name) => {
    return await WizardModel.updateOne({"_id": wizard}, {"user.name": name}).exec() ?? false;
}

exports.deleteUser = async (wizard) => {
    return await WizardModel.findOneAndDelete({
        "_id": wizard,
        "user.isActive": true,
        "user.isEnabled": true
    }) ?? false;
}

exports.editMasterPassword = async (wizard, newMasterPassword) => {
    return await WizardModel.findByIdAndUpdate(wizard, {"user.masterPassword": newMasterPassword}) ?? false;
}