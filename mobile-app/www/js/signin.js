/********************/
/* Global variables */
/********************/

var isLocalMode = false;
var globalFirstName;
var globalLastName;
var globalEmail;

/***********************************/
/* Web worker for background tasks */
/**********************************/

var cryptoWorker = new Worker("./js/crypto-worker.js");

cryptoWorker.addEventListener("message", function(e) {
	var args = e.data.args;
	if(args[0] == "generateMasterPasswordHash") {
		const email = $("#signinEmail").val();
		const masterPasswordHash = args[1];
		signin(email, masterPasswordHash);
	}
	else if(args[0] == "signUp") {
		const masterPasswordHash = args[1];
		const protectedSymmetricKey = args[2];
		localStorage.setItem("magicKey", protectedSymmetricKey);
		if(isLocalMode) {
			signin("", masterPasswordHash);
		}
		else {
			signup(globalFirstName, globalLastName, globalEmail, masterPasswordHash, protectedSymmetricKey);
		}
	}
});

/***************************/
/* Check if user is logged */
/***************************/

if(localStorage.getItem("loginType") == "profile" || localStorage.getItem("loginType") == "local") {
	window.location.replace("./vault.html");
}
else {
	showLoader(false);
}

/**************************************/
/* Utility: clear all modals on close */
/**************************************/

$('.modal').on('hidden.bs.modal', function (e) {
	$(this)
		.find("input,textarea,select")
		.val('')
		.end()
		.find("input[type=checkbox], input[type=radio]")
		.prop("checked", "checked")
		.end()
		.find("select")
		.prop("selectedIndex", 0);
	setPasswordStrength(true, "#signupPassword", "#signupPasswordStrength");
	clickEye("#signupPassword", "#eyeSignupPassword", true);
	clickEye("#signupPasswordConfirm", "#eyeSignupPasswordConfirm", true);
});

/******************/
/* SignIn process */
/******************/

$("#signinEmail, #signinPassword").on('keypress',function(e) {
    if(e.which == 13) {
        $("#signinButton").click();
    }
});

$("#signinButton").click(function(){
	var email = $("#signinEmail");
	var password = $("#signinPassword");
	if(!email.val().match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/) && !isLocalMode) {
		email.focus();
		showFeedback(translateString("feedback-title-error"), translateString("signin-feedback-email-error"));
	}
	else if(!password.val().trim().length) {
		password.focus();
		showFeedback(translateString("feedback-title-error"), translateString("signin-feedback-password-error"));
	}
	else if(!password.val().match(/^(?=.*\d)(?=.*[!@#$%^&*;])(?=.*[a-z])(?=.*[A-Z]).{8,}$/)) {
		password.focus();
		showFeedback(translateString("feedback-title-error"), translateString("signin-feedback-password-complexity-error"));
	}
	else {
		showLoader(true);
		if(isLocalMode) {
			cryptoWorker.postMessage({ "args": [ "signUp", password.val(), email.val() ] });
		}
		else {
			cryptoWorker.postMessage({ "args": [ "generateMasterPasswordHash", password.val(), email.val() ] });
		}
	}
});

function signin(email, masterPasswordHash) {
	if(!isLocalMode) {
		/* TODO */
		// Chiamata AJAX al Server
		//showLoader(false);
		//showFeedback(translateString("feedback-title-error"), translateString("signin-feedback-credentials-error"));
		localStorage.setItem("magicKey", "DOWNLOADED_FROM_SERVER");
		localStorage.setItem("firstName", "Alessandro");
		localStorage.setItem("lastName", "Fontana");
		localStorage.setItem("email", email);
		localStorage.setItem("loginType", "profile");
	}
	else {
		localStorage.setItem("loginType", "local");
	}
	window.location.replace("./vault.html");
}

/******************/
/* SignUp process */
/******************/

$("#signupButton").click(function(){
	var firstName = $("#signupFirstName");
	var lastName = $("#signupLastName");
	var email = $("#signupEmail");
	var password = $("#signupPassword");
	var passwordConfirm = $("#signupPasswordConfirm");
	if(!firstName.val().trim().length) {
		firstName.focus();
		showFeedback(translateString("feedback-title-error"), translateString("signin-feedback-first-name-error"));
	}
	else if(!lastName.val().trim().length) {
		lastName.focus();
		showFeedback(translateString("feedback-title-error"), translateString("signin-feedback-last-name-error"));
	}
	else if(!email.val().match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)) {
		email.focus();
		showFeedback(translateString("feedback-title-error"), translateString("signin-feedback-email-error"));
	}
	else if(!password.val().trim().length) {
		password.focus();
		showFeedback(translateString("feedback-title-error"), translateString("signin-feedback-password-error"));
	}
	else if(!password.val().match(/^(?=.*\d)(?=.*[!@#$%^&*;])(?=.*[a-z])(?=.*[A-Z]).{8,}$/)) {
		password.focus();
		showFeedback(translateString("feedback-title-error"), translateString("signin-feedback-password-complexity-error"));
	}
	else if(!passwordConfirm.val().trim().length) {
		passwordConfirm.focus();
		showFeedback(translateString("feedback-title-error"), translateString("signin-feedback-password-confirm-error"));
	}
	else if(password.val() != passwordConfirm.val()) {
		passwordConfirm.val("");
		passwordConfirm.focus();
		showFeedback(translateString("feedback-title-error"), translateString("signin-feedback-password-match-error"));
	}
	else {
		globalFirstName = firstName.val();
		globalLastName = lastName.val();
		globalEmail = email.val();
		$("#signupModal").modal("hide");
		showLoader(true);
		cryptoWorker.postMessage({ "args": [ "signUp", password.val(), email.val() ] });
	}
});

function signup(firstName, lastName, email, masterPasswordHash, magicPassword) {
	/* TODO */
	// Chiamata AJAX al Server
	//showLoader(false);
	//$("#feedbackModal").modal("show");
	/* Confirm account */
	localStorage.setItem("firstName", firstName);
	localStorage.setItem("lastName", lastName);
	localStorage.setItem("email", email);
	localStorage.setItem("loginType", "profile");
	window.location.replace("./vault.html");
}

/**************/
/* Local mode */
/**************/

$(document).ready(function() {
	$("#localMode").change(function() {
		if ($(this).is(":checked")) {
			isLocalMode = true;
			$("#signinEmail").val("");
			$("#signinPassword").focus();
			$("#signinEmail").prop("disabled", true);
			$("#passwordProgressBar").removeClass("d-none");
		}
		else {
			isLocalMode = false;
			$("#signinEmail").prop("disabled", false);
			$("#passwordProgressBar").addClass("d-none");
		}
	});
});

/*********************/
/* Password strength */
/*********************/

$(document).ready(function() {
	$("#signinPassword").on("input", function() {
		setPasswordStrength(false, "#signinPassword", "#passwordStrength");
	});
	$("#signupPassword").on("input", function() {
		setPasswordStrength(false, "#signupPassword", "#signupPasswordStrength");
	});
});

/**********************/
/* Show/hide password */
/**********************/

$(document).ready(function() {
	$("#signinPasswordEye").click(function(e){
		if (e.target == e.currentTarget) {
			clickEye("#signinPassword", "#eyeSigninPassword", false);
		}
	});
	$("#signupPasswordEye").click(function(e){
		if (e.target == e.currentTarget) {
			clickEye("#signupPassword", "#eyeSignupPassword", false);
		}
	});
	$("#signupPasswordConfirmEye").click(function(e){
		if (e.target == e.currentTarget) {
			clickEye("#signupPasswordConfirm", "#eyeSignupPasswordConfirm", false);
		}
	});
});