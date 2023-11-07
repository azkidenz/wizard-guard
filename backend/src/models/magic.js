const WizardModel = require('./wizard');

exports.getMagicKey = async (id) => {
    return await WizardModel.findById(id, "-_id magicKey").exec() ?? undefined;
}

exports.setMagicKey = async (id, magic) => {
    return await WizardModel.updateOne({"_id": id}, {"magicKey": magic}).exec();
}