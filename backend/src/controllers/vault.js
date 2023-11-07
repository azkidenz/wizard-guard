const VaultModel = require("../models/vault");
const mongoose = require("mongoose");

exports.vaultItemData = (value, updatedAt) => {
    const pow = updatedAt.length === 10 ? 1000 : 1;
    return {
        id: new mongoose.mongo.ObjectId(),
        value: value,
        updatedAt: updatedAt * pow
    }
}

exports.pushManyVaultItems = async (wizard, items) => {
    const ids = [];
    for (const single of items) {
        const one = await this.pushOneVaultItem(wizard, single);
        ids.push(one);
    }
    return ids;
}

exports.pushOneVaultItem = async (wizard, one) => {
    const data = this.vaultItemData(one.value, one.updatedAt);
    if(!await VaultModel.pushVaultItem(wizard, data))
        return false;
    return data.id;
}

exports.updateManyVaultItems = async (wizard, items) => {
    for (const single of items) {
        const flag = await VaultModel.updateVaultItem(wizard, single);
        if(!flag)
            return false;
    }
    return true;
}

exports.deleteManyVaultItems = async (wizard, items) => {
    for (const single of items) {
        const flag = await VaultModel.deleteVaultItem(wizard, single);
        if(!flag)
            return false;
    }
    return true;
}

exports.getVault = async (wizard) => {
    const vault = await VaultModel.getVault(wizard);
    if(!vault)
        return undefined;
    return vault;
}

