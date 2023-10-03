/*
Example:

const totp = generateTotp("JBSWY3DPEHPK3PXP");

*/

const totp = require("totp-generator");

global.generateTotp = function(secret) {
	var totpOutput = "";
	if(secret) {
		try {
			totpOutput = totp(secret);
		}
		catch(err) {
			totpOutput = "";
		}
	}
	return totpOutput;
}