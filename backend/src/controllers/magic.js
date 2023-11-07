const MagicModel = require("../models/magic");

const MagicNull = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

exports.empty = () => {
    return MagicNull;
}

exports.isEmpty = async (id) => {
    const data = await MagicModel.getMagicKey(id);
    return (data !== false && data.magicKey === MagicNull);
}