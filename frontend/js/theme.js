/******************************/
/* Set theme before page load */
/******************************/

const theme = localStorage.getItem('theme');
if (theme == "dark") {
	document.documentElement.setAttribute('data-bs-theme', 'dark');
}
var linkElement = document.createElement("link");
linkElement.id = "themeFile";
linkElement.rel = "stylesheet";
linkElement.type = "text/css";
linkElement.href = "./css/theme-" + theme + ".css";
document.getElementsByTagName('head')[0].appendChild(linkElement);