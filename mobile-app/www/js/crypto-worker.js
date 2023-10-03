importScripts("./crypto.js");

self.addEventListener("message", function(e) {
	var args = e.data.args;
	if(args[0] == "signUp") {
		const masterPasswordHash = generateMasterPasswordHash(args[1], args[2]);
		const protectedSymmetricKey = generateProtectedSimmetricKey(args[1], args[2]);
		self.postMessage({ "args": [ "signUp", masterPasswordHash, protectedSymmetricKey ] });
	}
	else if(args[0] == "generateMasterPasswordHash") {
		const masterPasswordHash = generateMasterPasswordHash(args[1], args[2]);
		self.postMessage({ "args": [ "generateMasterPasswordHash", masterPasswordHash ] });
	}
	else if(args[0] == "generateProtectedSimmetricKey") {
		const protectedSymmetricKey = generateProtectedSimmetricKey(args[1], args[2]);
		self.postMessage({ "args": [ "generateProtectedSimmetricKey", protectedSymmetricKey ] });
	}
	else if(args[0] == "decryptSimmetricKey") {
		try {
			const symmetricKey = decryptSimmetricKey(args[1], args[2], args[3]);
			self.postMessage({ "args": [ "decryptSimmetricKey", symmetricKey ] });
		}
		catch(e) {
			self.postMessage({ "args": [ "decryptSimmetricKey", "" ] });
		}
		
	}
}, false);