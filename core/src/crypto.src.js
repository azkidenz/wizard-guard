/*
Example:

var masterPassword = "P4ssw0rd!";
var email = "example@example.com";
var data = "Secret data.";

const masterPasswordHash = generateMasterPasswordHash(masterPassword, email);
const protectedSymmetricKey = generateProtectedSimmetricKey(masterPassword, email);
const symmetricKey = decryptSimmetricKey(masterPassword, email, protectedSymmetricKey);
const cipherObject = createCipherObject(symmetricKey, data);
const decryptedCipherObject = decryptCipherObject(symmetricKey, cipherObject);

Other utilities:

var lenght = 20;
var isComplexPassword = true;

const randomPassword = generateRandomPassword(length, isComplexPassword);

*/

const CryptoJS = require("crypto-js");

function generateMasterKey(masterPassword, email) {
	
	/*
	When the Create Account form is submitted, uses Password-Based Key Derivation
	Function 2 (PBKDF2) with 100,000 iteration rounds to stretch the user's Master Password with
	a salt of the user's email address. The resulting salted value is the 256 bit Master Key.
	*/
	
	return CryptoJS.PBKDF2(masterPassword, email, {
		keySize: 256 / 32,
		iterations: 100000,
	}).toString();
}

function generateStretchedMasterKey(masterKey, email) {
	
	/*
	The Master Key is additionally stretched to 512 bits in length using HMAC-based
	Extract-and-Expand Key Derivation Function (HKDF). The Master Key and Stretched Master
	Key are never stored on or transmitted.
	*/

	return HKDF(masterKey, email, "Master Key", 512 / 8);
}

function HKDF(masterKey, salt, info, keyLengthInBytes) {
	const prk = CryptoJS.HmacSHA256(masterKey, salt);
	const prkWordArray = CryptoJS.enc.Hex.parse(prk.toString());
	const infoWordArray = CryptoJS.enc.Utf8.parse(info);
	const keyingMaterial = CryptoJS.lib.WordArray.create();
	for (let i = 0; i < Math.ceil(keyLengthInBytes / 32); i++) {
		const input = CryptoJS.lib.WordArray.create().concat(prkWordArray).concat(infoWordArray).concat(CryptoJS.lib.WordArray.create([i + 1], 1));
		const output = CryptoJS.HmacSHA256(input, prk);
		keyingMaterial.concat(output);
	}
	const extendedKey = keyingMaterial.toString(CryptoJS.enc.Hex).substring(0, keyLengthInBytes * 2);
	return extendedKey;
}

global.generateProtectedSimmetricKey = function(masterPassword, email) {
	
	const masterKey = generateMasterKey(masterPassword, email);
	const stretchedMasterKey = generateStretchedMasterKey(masterKey, email);

	/*
	In addition, a 512-bit Symmetric Key and an Initialization Vector is generated using a
	Cryptographically Secure Pseudorandom Number Generator (CSPRNG).
	*/

	const symmetricKey = CryptoJS.lib.WordArray.random(64).toString(CryptoJS.enc.Hex);
	const initializationVector = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);

	/*
	The Symmetric key is encrypted with AES-256 bit encryption using the Stretched Master Key and the Initialization
	Vector. The resulting key is called the Protected Symmetric Key. The Protected Symmetric Key
	is the main key associated with the user and sent to the server upon account creation, and
	sent back to the Client apps upon syncing.
	*/

	const protectedSymmetricKey = CryptoJS.AES.encrypt(symmetricKey, stretchedMasterKey, {
		iv: CryptoJS.enc.Hex.parse(initializationVector),
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.NoPadding,
		keySize: 256 / 32,
	}).toString();
	
	return protectedSymmetricKey;
}

global.generateMasterPasswordHash = function(masterPassword, email) {
	
	const masterKey = generateMasterKey(masterPassword, email);
	
	/*
	A Master Password hash is also generated using PBKDF-SHA256 with a payload of Master
	Key and with a salt of the Master Password. The Master Password hash is sent to the server
	upon account creation and login, and used to authenticate the user account.
	*/

	return CryptoJS.PBKDF2(masterKey, masterPassword, {
		keySize: 256 / 32,
		iterations: 1,
		hasher: CryptoJS.algo.SHA256
	}).toString();
}

global.decryptSimmetricKey = function(masterPassword, email, protectedSymmetricKey) {
	
	const masterKey = generateMasterKey(masterPassword, email);
	const stretchedMasterKey = generateStretchedMasterKey(masterKey, email);
	
	/*
	The Protected Symmetric Key is
	decrypted using the Stretched Master Key. The Symmetric Key is used to decrypt Vault Items
	*/
	
	return CryptoJS.AES.decrypt(protectedSymmetricKey, stretchedMasterKey, {
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.NoPadding,
		keySize: 256 / 32,
	}).toString(CryptoJS.enc.Utf8);
}

global.createCipherObject = function(symmetricKey, data) {
	
	/*
	All information (Logins, Cards, Identities, Notes) associated with your stored vault data is 
	protected with end-to-end encryption. Items that you choose to store in your Bitwarden vault 
	are first stored with an item called a Cipher object. Cipher objects are encrypted with your 
	Generated Symmetric Key
	*/
	
	return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(data), CryptoJS.enc.Hex.parse(symmetricKey), {
		iv: CryptoJS.enc.Hex.parse(symmetricKey),
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7,
		keySize: 256 / 32,
	}).toString();

}

global.decryptCipherObject = function(symmetricKey, encryptedData) {
	
	/*
	Which can only be known by decrypting your protected Symmetric 
	Key using your Stretched Master Key
	*/
	
	return CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Hex.parse(symmetricKey), {
		iv: CryptoJS.enc.Hex.parse(symmetricKey),
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7,
		keySize: 256 / 32,
	}).toString(CryptoJS.enc.Utf8);
}

global.generateRandomPassword = function(length, isComplexPassword) {
	
	/*
	Random password generator
	*/
	
	const charsetComplex = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';
	const charsetSimple = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	var charset = charsetSimple;
	if(isComplexPassword) {
		charset = charsetComplex;
	}
	let password = "";
	for (let i = 0; i < length; i++) {
		const randomIndex = CryptoJS.lib.WordArray.random(1).words[0] % charset.length;
		password += charset[randomIndex];
	}
	return password;
}