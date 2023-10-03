/***********************/
/* Prevent concurrency */
/***********************/

var deviceReady = false;
var documentReady = false;

document.addEventListener("deviceready", onDeviceReady, false);

$(document).ready(function() {
	
	$("#openSettingsButton, #openSettingsTextButton").click(function(){
		window.cordova.plugins.settings.open("settings");
	});
	
	documentReady = true;
	showMobileHint();
});

function onDeviceReady() {
	deviceReady = true;
	showMobileHint();
}

function showMobileHint() {
	if(!deviceReady || !documentReady) {
		return;
	}
	if(window.cordova && window.cordova.plugins.settings) {
		$("#mobileHintMenu").removeClass("d-none");
		var firstAccess = localStorage.getItem("firstAccess") == undefined ? "true" : localStorage.getItem("firstAccess");
		if(firstAccess == "true") {
			localStorage.setItem("firstAccess", "false");
			console.log("vai");
			$("#mobileHintModal").modal("show");
		}
	}
}