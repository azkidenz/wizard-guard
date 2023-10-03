/***************/
/* Back button */
/***************/

document.addEventListener("backbutton", onBackButton, false);

function onBackButton() {
	if($('.modal').hasClass('show')) {
		$('.modal').modal('hide');
		event.preventDefault();
	}
	else {
		navigator.app.exitApp();
	}
}