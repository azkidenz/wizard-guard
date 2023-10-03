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
});

/**********/
/* Logout */
/**********/

$(document).ready(function() {
	if(localStorage.getItem("loginType") == "local") {
		$("#localLogout").removeClass("d-none");
	}
	$("#logoutButton").click(function(){
		showLoader(true);
		const language = localStorage.getItem("locale");
		const theme = localStorage.getItem("theme");
		localStorage.clear();
		sessionStorage.clear();
		localStorage.setItem("locale", language);
		localStorage.setItem("theme", theme);
		localStorage.setItem("firstAccess", "false");
		/* TODO */
		// Chiamata AJAX al Server
		window.location.replace("./signin.html");
	});
});