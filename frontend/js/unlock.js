/***************************/
/* Check if user is logged */
/***************************/

if(localStorage.getItem("loginType") != "profile" && localStorage.getItem("loginType") != "local") {
	window.location.replace("./signin.html");
}
else {
	showLoader(false);
}

/***********************************/
/* Web worker for background tasks */
/***********************************/

var cryptoWorker = new Worker("./js/crypto-worker.js");

cryptoWorker.addEventListener("message", function(e) {
	var args = e.data.args;
	if(args[0] == "decryptSimmetricKey") {
		if(args[1] == "") {
			showLoader(false);
			showFeedback(translateString("feedback-title-error"), translateString("unlock-feedback-password-error"));
		}
		else {
			sessionStorage.setItem("symmetricKey", args[1]);
			window.location.replace("./vault.html");
		}
	}
});

/****************/
/* Unlock vault */
/****************/

$("#password").on('keypress',function(e) {
    if(e.which == 13) {
        $("#unlockButton").click();
    }
});

$("#unlockButton").click(function(){
	const password = $("#password");
	if(!password.val().trim().length) {
		password.focus();
		showFeedback(translateString("feedback-title-error"), translateString("signin-feedback-password-error"));
	}
	else {
		showLoader(true);
		cryptoWorker.postMessage({ "args": [ "decryptSimmetricKey", password.val(), localStorage.getItem("email") == undefined ? "" : localStorage.getItem("email"), localStorage.getItem("magicKey") ] });
	}
});

/**********************/
/* Show/hide password */
/**********************/

$(document).ready(function() {
	$("#passwordEye").click(function(){
		clickEye("#password", "#eyePassword", false);
	});
});