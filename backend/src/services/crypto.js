const CryptoJS = require("crypto-js");

exports.generateRandomSalt = (bytes = 16) => {
	return CryptoJS.lib.WordArray.random(bytes).toString(CryptoJS.enc.Hex);
};

exports.generateMasterPasswordHashHash = (masterPasswordHash, randomSalt) => {
	return CryptoJS.PBKDF2(masterPasswordHash, randomSalt, {
		keySize: 256 / 32,
		iterations: 100000,
		hasher: CryptoJS.algo.SHA256
	}).toString();
};

exports.verifyMasterPasswordHash = (masterPasswordHash, salt, masterPasswordHashHash) => {
	return this.generateMasterPasswordHashHash(masterPasswordHash, salt) === masterPasswordHashHash;
};