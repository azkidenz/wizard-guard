/********************/
/* Global variables */
/********************/

var isLocalMode = false;
var globalFirstName;
var globalLastName;
var globalEmail;

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
	clickEye("#deletePassword", "#eyeDeletePassword", true);
	clickEye("#changeOldPassword", "#eyeChangeOldPassword", true);
	clickEye("#changePassword", "#eyeChangePassword", true);
	clickEye("#changePasswordConfirm", "#eyeChangePasswordConfirm", true);

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
			startCryptoWorker("signUp", [password.val(), email.val()], "signUpCallback", []);
		}
		else {
			startCryptoWorker("generateMasterPasswordHash", [password.val(), email.val()], "signin", [email.val()]);
		}
	}
});

function signUpCallback(masterPasswordHash, protectedSymmetricKey) {
	localStorage.setItem("magicKey", protectedSymmetricKey);
	if(isLocalMode) {
		signin("", masterPasswordHash);
	}
	else {
		signup(globalFirstName, globalLastName, globalEmail, masterPasswordHash, protectedSymmetricKey);
	}
}

function signin(email, masterPasswordHash) {
	if(!isLocalMode) {
		let data = {
			email: email,
			password: masterPasswordHash
		};
		callApi("user/signin", "POST", data, true,
			function(result){
				showFeedback(translateString("feedback-title-success"), translateString("signin-feedback-key-decryption"));
				localStorage.setItem("firstName", result.data.name.firstName);
				localStorage.setItem("lastName", result.data.name.lastName);
				localStorage.setItem("email", email);
				if(localStorage.getItem("magicKey") != undefined) {
					sendMagicKey(localStorage.getItem("magicKey"), false);
				}
				else {
					getMagicKey($("#signinPassword").val(), $("#signinEmail").val(), "decryptSimmetricKeyCallback", []);
				}
			},
			function(result) {
				showLoader(false);
				showBackendError(result);
			}
		);
	}
	else {
		localStorage.setItem("loginType", "local");
		window.location.replace("./vault.html");
	}
}

function sendMagicKey(protectedSymmetricKey, isSignUp) {
	let data = {
		magicKey: protectedSymmetricKey
	};
	callApi("magicKey", "POST", data, true,
		function(result){
			if(isSignUp) {
				localStorage.removeItem("magicKey");
				localStorage.removeItem("accessToken");
				localStorage.removeItem("refreshToken");
				showLoader(false);
				$("#feedbackModal").modal("show");
			}
			else {
				localStorage.setItem("loginType", "profile");
				startCryptoWorker("decryptSimmetricKey", [$("#signinPassword").val(), $("#signinEmail").val(), protectedSymmetricKey], "decryptSimmetricKeyCallback", []);
			}
		},
		function(result) {
			showLoader(false);
			showBackendError(result);
		}
	);
}

function decryptSimmetricKeyCallback(symmetricKey) {
	if(symmetricKey != "") {
		sessionStorage.setItem("symmetricKey", symmetricKey);
		window.location.replace("./vault.html");
	}
}

function getMagicKey(password, email, callback, callbackParameters) {
	callApi("magicKey", "GET", "", true,
		function(result){
			localStorage.setItem("magicKey", result.data.magicKey);
			localStorage.setItem("loginType", "profile");
			startCryptoWorker("decryptSimmetricKey", [password, email, result.data.magicKey], callback, callbackParameters);
		},
		function(result) {
			showLoader(false);
			showBackendError(result);
		}
	);
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
		showFeedback(translateString("feedback-title-success"), translateString("signin-feedback-key-creation"));
		startCryptoWorker("signUp", [password.val(), email.val()], "signUpCallback", []);
	}
});

function signup(firstName, lastName, email, masterPasswordHash, protectedSymmetricKey) {
	let data = {
		name: {
			firstName: firstName,
			lastName: lastName
		},
		email: email,
		password: masterPasswordHash
	};
	callApi("user/signup", "POST", data, true,
		function(result){
			sendMagicKey(protectedSymmetricKey, true)
		},
		function(result) {
			showLoader(false);
			showBackendError(result);
		}
	);
}

/*******************************/
/* SignIn process - activation */
/*******************************/

function getUrlParameter(sParam) {
	var sPageURL = window.location.search.substring(1);
	var sURLVariables = sPageURL.split('&');
	var sParameterName;
	for(var i=0; i<sURLVariables.length; i++) {
		sParameterName = sURLVariables[i].split('=');
		if (sParameterName[0] === sParam) {
			return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
		}
	}
	return false;
};

$(document).ready(function() {
	const action = getUrlParameter("a");
	const token = getUrlParameter("t");
	
	if(action == "verify" && token) {
		showLoader(true);
		let data = {
			token: token
		};
		callApi("user/signup/verify", "POST", data, true,
			function(result){
				showLoader(false);
				$("#signinEmail").focus();
				showFeedback(translateString("feedback-title-success"), translateString("signin-signup-activation"));
			},
			function(result) {
				showLoader(false);
				showBackendError(result);
			}
		);
	}
	
	if(action == "delete" && !token) {
		showFeedback(translateString("feedback-title-success"), translateString("vault-profile-delete-description-2"));
	}
	else if(action == "delete" && token) {
		$("#deleteModalToken").val(token);
		$("#deleteModal").modal("show");
	}
	else if(action == "deleted") {
		showFeedback(translateString("feedback-title-success"), translateString("signin-profile-deleted"));
	}
	else if(action == "expired") {
		showFeedback(translateString("feedback-title-error"), translateString("signin-session-expired"));
	}
	else if(action == "password" && !token) {
		showFeedback(translateString("feedback-title-success"), translateString("signin-password-reset"));
	}
	else if(action == "password" && token) {
		$("#changePasswordModalToken").val(token);
		$("#changePasswordModal").modal("show");
	}
	else if(action == "changed") {
		showFeedback(translateString("feedback-title-success"), translateString("signin-password-changed"));
	}
});

/******************/
/* Delete profile */
/******************/

$(document).ready(function() {
	$("#deleteProfileButton").click(function(){
		var email = $("#deleteModalEmail");
		var password = $("#deletePassword");
		if(!email.val().match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/) && !isLocalMode) {
			email.focus();
			showFeedback(translateString("feedback-title-error"), translateString("signin-feedback-email-error"));
		}
		else if(!password.val().trim().length) {
			password.focus();
			showFeedback(translateString("feedback-title-error"), translateString("signin-feedback-password-error"));
		}
		else {
			showLoader(true);
			startCryptoWorker("generateMasterPasswordHash", [$("#deletePassword").val(), $("#deleteModalEmail").val()], "confirmProfileDeletion", [$("#deleteModalEmail").val(), $("#deleteModalToken").val()]);
			$("#deleteModal").modal("hide");
		}
	});
});

function confirmProfileDeletion(email, token, masterPasswordHash) {
	let data = {
		token: token,
		password: masterPasswordHash
	};
	callApi("user/delete/verify", "DELETE", data, true,
		function(result){
			window.location.replace("./signin.html?a=deleted");
		},
		function(result) {
			showLoader(false);
			$("#deleteModalEmail").val(email);
			$("#deleteModalToken").val(token);
			$("#deleteModal").modal("show");
			showBackendError(result);
		}
	);
}

/*******************/
/* Change password */
/*******************/

$(document).ready(function() {
	$("#changePasswordButton").click(function(e){
		var email = $("#changePasswordEmail");
		var oldPassword = $("#changeOldPassword");
		var password = $("#changePassword");
		var passwordConfirm = $("#changePasswordConfirm");
		if(!email.val().match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)) {
			email.focus();
			showFeedback(translateString("feedback-title-error"), translateString("signin-feedback-email-error"));
		}
		else if(!oldPassword.val().trim().length) {
			oldPassword.focus();
			showFeedback(translateString("feedback-title-error"), translateString("vault-feedback-current-password-error"));
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
			$("#changePasswordModal").modal("hide");
			showLoader(true);
			startCryptoWorker("changePassword", [oldPassword.val(), password.val(), email.val()], "changePasswordCallback", [$("#changePasswordModalToken").val(), email.val(), oldPassword.val(), password.val()]);
		}
	});
});

function changePasswordCallback(token, email, masterPassword, newMasterPassword, masterPasswordHash, newMasterPasswordHash) {
	let data = {
		email: email,
		password: masterPasswordHash
	};
	callApi("user/signin", "POST", data, true,
		function(result){
			getMagicKey(masterPassword, email, "changePasswordChangeMagicKey", [token, email, masterPassword, newMasterPassword, masterPasswordHash, newMasterPasswordHash]);
		},
		function(result) {
			changePasswordFail(result, email, token);
		}
	);
}

function changePasswordChangeMagicKey(token, email, masterPassword, newMasterPassword, masterPasswordHash, newMasterPasswordHash, symmetricKey) {
	if(symmetricKey) {
		startCryptoWorker("generateProtectedSimmetricKeyFromCurrentMasterKey", [newMasterPassword, email, symmetricKey], "changePasswordChangeMagicKeyCallback", [token, email, masterPasswordHash, newMasterPasswordHash]);
	}
	else {
		changePasswordFail(undefined, email, token);
	}
}

function changePasswordChangeMagicKeyCallback(token, email, masterPasswordHash, newMasterPasswordHash, protectedSymmetricKey) {
	let data = {
		magicKey: protectedSymmetricKey
	};
	callApi("magicKey", "POST", data, true,
		function(result){
			let data = {
				token: token,
				oldPassword: masterPasswordHash,
				newPassword: newMasterPasswordHash
			};
			callApi("user/password/edit", "PUT", data, true,
				function(result){
					callApi("user/signout", "POST", "", false, function(result){}, function(result) {});
					clearData();
					window.location.replace("./signin.html?a=changed");
				},
				function(result) {
					// Rollback
					let data = {
						magicKey: localStorage.getItem("magicKey")
					};
					callApi("magicKey", "POST", data, true,
						function(result){
							changePasswordFail(undefined, email, token);
						},
						function(result){
							changePasswordFail(result, email, token);
						}
					);
				}
			);
		},
		function(result) {
			changePasswordFail(result, email, token);
		}
	);
}

function changePasswordFail(result, email, token) {
	/* TODO logout */ 
	callApi("user/signout", "POST", "", false, function(result){}, function(result) {});
	clearData();
	showLoader(false);
	$("#changePasswordEmail").val(email);
	$("#changePasswordModalToken").val(token);
	$("#changePasswordModal").modal("show");
	showBackendError(result);
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
	$("#deletePasswordEye").click(function(e){
		clickEye("#deletePassword", "#eyeDeletePassword", false);
	});
	$("#changeOldPasswordEye").click(function(e){
		clickEye("#changeOldPassword", "#eyeChangeOldPassword", false);
	});
	$("#changePasswordEye").click(function(e){
		clickEye("#changePassword", "#eyeChangePassword", false);
	});
	$("#changePasswordConfirmEye").click(function(e){
		clickEye("#changePasswordConfirm", "#eyeChangePasswordConfirm", false);
	});
});