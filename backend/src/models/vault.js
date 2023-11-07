const WizardModel = require('./wizard');

exports.getVault = async (wizard) => {
     return await WizardModel.findById(wizard, "-_id vault").exec() ?? false;
}

exports.getVaultItemById = async (wizard, id) => {
     return await WizardModel.findOne({"_id": wizard, "vault.id": id}).select({"_id": 0, "vault.$": 1}).exec() ?? false;
}

exports.pushVaultItem = async (wizard, item) => {
     return await WizardModel.findByIdAndUpdate(wizard, { $push: { "vault": item } }).exec() ?? false;
}

exports.updateVaultItem = async (wizard, item) => {
     return await WizardModel.findOneAndUpdate({"_id": wizard, "vault.id": item.id }, { "vault.0.value": item.value, "vault.0.updatedAt": item.updatedAt }).exec() ?? false;
}

exports.deleteVaultItem = async (wizard, id) => {
     return await WizardModel.findOneAndUpdate({"_id": wizard, "vault.id": id }, { $pull: { 'vault':  { 'id': id} }}).exec() ?? false;
}
