/*
Example:

const randomSalt = generateRandomSalt();
const masterPasswordHashHash = generateMasterPasswordHashHash(masterPasswordHash, randomSalt);
const isValidHash = verifyMasterPasswordHash(masterPasswordHash, randomSalt, masterPasswordHashHash);
*/

const CryptoJS = require("crypto-js");

var generateRandomSalt = function() {
	return CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
}

var generateMasterPasswordHashHash = function(masterPasswordHash, randomSalt) {
	
	/*
	Once reaching
	the server, the Mater Password hash is hashed again using PBKDF2-SHA256 with a random
	salt and 100,000 iterations.
	*/

	return CryptoJS.PBKDF2(masterPasswordHash, randomSalt, {
		keySize: 256 / 32,
		iterations: 100000,
		hasher: CryptoJS.algo.SHA256
	}).toString();
}

var verifyMasterPasswordHash = function(masterPasswordHash, randomSalt, masterPasswordHashHash) {
	
	/*
	A hash of the master key is sent to the
	server upon account creation and login, and used to authenticate the user account.
	*/

	return generateMasterPasswordHashHash(masterPasswordHash, randomSalt) === masterPasswordHashHash;
}

exports.generateRandomSalt = generateRandomSalt;
exports.generateMasterPasswordHashHash = generateMasterPasswordHashHash;
exports.verifyMasterPasswordHash = verifyMasterPasswordHash;