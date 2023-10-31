importScripts("./crypto.js?v202310281736");

self.addEventListener("message", function(e) {
	
	var args = e.data.args;
	const functionName = args[0];
	const functionParameters = args[1];
	const callback = args[2];
	const callbackParameters = args[3];
	var results = [];
	
	if(functionName == "generateMasterPasswordHash") {
		results[0] = generateMasterPasswordHash(functionParameters[0], functionParameters[1]);
	}
	else if(functionName == "signUp") {
		results[0] = generateMasterPasswordHash(functionParameters[0], functionParameters[1]);
		results[1] = generateProtectedSimmetricKey(functionParameters[0], functionParameters[1]);
	}
	else if(functionName == "changePassword") {
		results[0] = generateMasterPasswordHash(functionParameters[0], functionParameters[2]);
		results[1] = generateMasterPasswordHash(functionParameters[1], functionParameters[2]);
	}
	else if(functionName == "generateProtectedSimmetricKey") {
		results[0] = generateProtectedSimmetricKey(functionParameters[0], functionParameters[1]);
	}
	else if(functionName == "generateProtectedSimmetricKeyFromCurrentMasterKey") {
		results[0] = generateProtectedSimmetricKey(functionParameters[0], functionParameters[1], functionParameters[2]);
	}
	else if(functionName == "decryptSimmetricKey") {
		try {
			results[0] = decryptSimmetricKey(functionParameters[0], functionParameters[1], functionParameters[2]);
		}
		catch(e) {
			results[0] = "";
		}
		
	}
	
	self.postMessage({ "args": [ functionName, callback, callbackParameters, results ] });
}, false);