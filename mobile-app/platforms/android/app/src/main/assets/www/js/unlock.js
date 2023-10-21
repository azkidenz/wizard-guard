/***************************/
/* Check if user is logged */
/***************************/

if(localStorage.getItem("loginType") != "profile" && localStorage.getItem("loginType") != "local") {
	window.location.replace("./signin.html");
}
else {
	showLoader(false);
}

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
		startCryptoWorker("decryptSimmetricKey", [password.val(), localStorage.getItem("email") == undefined ? "" : localStorage.getItem("email"), localStorage.getItem("magicKey")], "decryptSimmetricKeyCallback", []);
	}
});

function decryptSimmetricKeyCallback(symmetricKey) {
	if(symmetricKey == "") {
		showLoader(false);
		showFeedback(translateString("feedback-title-error"), translateString("unlock-feedback-password-error"));
	}
	else {
		sessionStorage.setItem("symmetricKey", symmetricKey);
		window.location.replace("./vault.html");
	}
}

/**********************/
/* Show/hide password */
/**********************/

$(document).ready(function() {
	$("#passwordEye").click(function(){
		clickEye("#password", "#eyePassword", false);
	});
});