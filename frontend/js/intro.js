/***************************/
/* Check if user is logged */
/***************************/

if(localStorage.getItem("loginType") == "profile" || localStorage.getItem("loginType") == "local") {
	window.location.replace("./vault.html");
}
else {
	window.location.replace("./signin.html");	
}