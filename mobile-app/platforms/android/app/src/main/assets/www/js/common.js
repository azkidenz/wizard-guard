/***********************************/
/* Web worker for background tasks */
/**********************************/

var cryptoWorker = new Worker("./js/crypto-worker.js");

cryptoWorker.addEventListener("message", function(e) {
	var args = e.data.args;
	const callback = args[1];
	const callbackParameters = args[2];
	const results = args[3];
	const parameters = callbackParameters.concat(results);
	window[callback](...parameters);
});

function startCryptoWorker(functionName, functionParameters, callback, callbackParameters) {
	cryptoWorker.postMessage({ "args": [ functionName, functionParameters, callback, callbackParameters ] });
}

/***************/
/* Backend API */
/***************/

function callApi(url, type, data, async, onSuccess, onError) {
	const backend = "https://api.wizardguard.org/v1/";
	$.ajax({
		url: backend + url,
		type: type,
		data: data,
		dataType: "json",
		cache: false,
		crossDomain: true,
		async: async,
		headers: {
			"Authorization": "Bearer " + localStorage.getItem("accessToken"),
			"Accept": "application/json",
			"Accept-Language": getLocale(),
			"Access-Control-Allow-Origin": "*"
		},
		success: function(result) {
			if(result.status == "success") {
				if(result.data && result.data.accessToken) {
					localStorage.setItem("accessToken", result.data.accessToken);
				}
				if(result.data && result.data.refreshToken) {
					localStorage.setItem("refreshToken", result.data.refreshToken);
				}
				onSuccess(result);
			}
			else {
				verifyAccessToken(url, type, data, async, onSuccess, onError, result);
			}
		},
		error: function(result) {
			verifyAccessToken(url, type, data, async, onSuccess, onError, result);
		}
	});
}

function verifyAccessToken(url, type, data, async, onSuccess, onError, result) {
	if(result.status == 401 && result.responseJSON && result.responseJSON && result.responseJSON.message == "unauthorized" && localStorage.getItem("accessToken") != undefined) {
		localStorage.removeItem("accessToken");
		getAccessToken(url, type, data, async, onSuccess, onError);
	}
	else {
		onError(result);
	}
}

function getAccessToken(url, type, data, async, onSuccess, onError) {
	let refreshData = {
		refreshToken: localStorage.getItem("refreshToken")
	};
	callApi("auth/refreshTokens", "POST", refreshData, true,
		function(result){
			callApi(url, type, data, async, onSuccess, onError);
		},
		function(result) {
			signout("expired");
		}
	);
}

function showBackendError(result) {
	var details = translateString("feedback-generic-error");
	if(result && result.responseJSON && result.responseJSON.status == "error") {
		details = result.responseJSON.message;
	}
	else if(result && result.responseJSON && result.responseJSON.status == "fail") {
		details = translateString("feedback-fail-error");
	}
	showFeedback(translateString("feedback-title-error"), details);
}

/*****************************/
/* Utility: show/hide loader */
/*****************************/

function showLoader(show = true) {
	if(show) {
		$("#loading").removeClass("d-none");
		$("#mainContent").addClass("d-none");
	}
	else {
		$("#loading").addClass("d-none");
		$("#mainContent").removeClass("d-none");
	}
}

/******************************************/
/* Utility: show feedback toast and modal */
/******************************************/

function showFeedback(title, message) {
	const toastBootstrap = bootstrap.Toast.getOrCreateInstance($("#liveToast"));
	$("#toastTitle").text(title);
	$("#toastMessage").text(message);
	toastBootstrap.show();
}

/****************/
/* Change theme */
/****************/

$(document).ready(function() {
	let prefers = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	var theme = localStorage.getItem("theme") == undefined ? prefers : localStorage.getItem("theme");
	if(theme == undefined) {
		localStorage.setItem("theme", theme);
	}
	changeTheme(theme);
	$("#changeThemeMenu").click(function(){
		if(localStorage.getItem("theme") == "light") {
			changeTheme("dark");
		}
		else {
			changeTheme("light");
		}
	});
	$("#theme-light").click(function(){
		changeTheme("light");
	});
	$("#theme-dark").click(function(){
		changeTheme("dark");
	});
});

function changeTheme(theme) {
	$("#themeFile").attr("href", "./css/theme-"+theme+".css");
	$("html").attr("data-bs-theme", theme);
	$(".dropdown-theme").removeClass("active");
	$("#theme-"+theme).addClass("active");
	localStorage.setItem("theme", theme);
}

/**********************/
/* Show/hide password */
/**********************/

$(document).ready(function() {
	$("#signinPasswordEye").click(function(){
		clickEye("#signinPassword", "#eyeSigninPassword", false);
	});
	$("#signupPasswordEye").click(function(){
		clickEye("#signupPassword", "#eyeSignupPassword", false);
	});
	$("#signupPasswordConfirmEye").click(function(){
		clickEye("#signupPasswordConfirm", "#eyeSignupPasswordConfirm", false);
	});
});

function setEye() {
	$(".eye").click(function(){
		var wizId = $(this).attr("wiz-id");
		clickEye("#value-"+wizId, "#eye-"+wizId, false);
	});
}

function clickEye(input, eye, reset) {
	if($(input).attr("type") == "password" && !reset) {
		$(input).attr("type", "text");
		$(eye + " use").attr("xlink:href", "./img/bootstrap-icons.svg#eye-slash");
	}
	else {
		$(input).attr("type", "password");
		$(eye + " use").attr("xlink:href", "./img/bootstrap-icons.svg#eye");
	}
}

/*********************/
/* Password strength */
/*********************/

function calculatePasswordStrength(password) {
	var strength = 0;
	// More than 8 chracters
	if (password.length >= 8) {
		strength = strength + 1;
	}
	// More than 16 chracters
	if (password.length >= 16) {
		strength = strength + 1;
	}
	// Lowercase
	if (/[a-z]/.test(password)) {
		strength = strength + 1;
	}
	// Uppercase
	if (/[A-Z]/.test(password)) {
		strength = strength + 1;
	}
	// Number
	if (/\d/.test(password)) {
		strength = strength + 2;
	}
	// Special character
	if (/[^a-zA-Z0-9]/.test(password)) {
		strength = strength + 2;
	}
	// No number and symbol at extremes
	if (!/^[0-9!@#$%^&*()_+{}\[\]:;<>,.!?~\\-]+$/.test(password)) {
		strength = strength + 2;
	}
	// Min length
	if (password.length == 0) {
		strength = 0;
	}
	else if (password.length < 8) {
		strength = 1;
	}
	return strength * 10;
}

function setPasswordStrength(reset, input, output) {
	$(output).removeClass("bg-success");
	$(output).removeClass("bg-warning");
	$(output).removeClass("bg-danger");
	if(reset) {
		$(output).width("0%");
		return;
	}
	var strength = calculatePasswordStrength($(input).val());
	if(strength >= 90) {
		$(output).addClass("bg-success");
	}
	else if(strength >= 50) {
		$(output).addClass("bg-warning");
	}
	else {
		$(output).addClass("bg-danger");
	}
	$(output).width(strength+"%");
}

$(document).ready(function() {
	$("#signinPassword").on("input", function() {
		setPasswordStrength(false, "#signinPassword", "#passwordStrength");
	});
	$("#signupPassword").on("input", function() {
		setPasswordStrength(false, "#signupPassword", "#signupPasswordStrength");
	});
	$("#passwordPassword").on("input", function() {
		setPasswordStrength(false, "#passwordPassword", "#passwordStrength");
	});
	$("#profilePassword").on("input", function() {
		setPasswordStrength(false, "#profilePassword", "#profilePasswordStrength");
	});
	$("#changePassword").on("input", function() {
		setPasswordStrength(false, "#changePassword", "#changePasswordStrength");
	});
});

/**********/
/* Logout */
/**********/

function signout(action) {
	showLoader(true);
	if(action == "expired") {
		clearData();
		window.location.replace("./signin.html?a=expired");
	}
	else {
		callApi("user/signout", "POST", "", true,
			function(result){
				checkAction(action);
			},
			function(result) {
				checkAction(action);
			}
		);
	}
}

function checkAction(action) {
	clearData();
	if(action == "delete") {
		window.location.replace("./signin.html?a=delete");
	}
	else if(action == "password") {
		window.location.replace("./signin.html?a=password");
	}
	else {
		window.location.replace("./signin.html");
	}
}

function clearData() {
	const language = localStorage.getItem("locale");
	const theme = localStorage.getItem("theme");
	localStorage.clear();
	sessionStorage.clear();
	localStorage.setItem("locale", language);
	localStorage.setItem("theme", theme);
	localStorage.setItem("firstAccess", "false");
}

$(document).ready(function() {
	if(localStorage.getItem("loginType") == "local") {
		$("#localLogout").removeClass("d-none");
	}
	$("#logoutButton").click(function(){
		signout();
	});
});