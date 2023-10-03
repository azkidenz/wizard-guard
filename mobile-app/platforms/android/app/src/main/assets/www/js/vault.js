/********************/
/* Global variables */
/********************/

var readOnlyMode = false;
var itemsCounter = 1;

/***************************/
/* Check if user is logged */
/***************************/

if(localStorage.getItem("loginType") != "profile" && localStorage.getItem("loginType") != "local") {
	window.location.replace("./signin.html");
}
else if(!sessionStorage.getItem("symmetricKey")) {
	window.location.replace("./unlock.html");
}
else {
	setMainTable();
	showLoader(false);
}

/************************/
/* Secure local storage */
/************************/

function secureLocalStorageGetItem(key) {
	const data = localStorage.getItem(key);
	if(data) {
		const symmetricKey = sessionStorage.getItem("symmetricKey");
		return decryptCipherObject(symmetricKey, data);
	}
	return "";
}

function secureLocalStorageSetItem(key, value) {
	const symmetricKey = sessionStorage.getItem("symmetricKey");
	const data = createCipherObject(symmetricKey, value);
	localStorage.setItem(key, data);
}

/**************************/
/* Profile initialization */
/**************************/

$('#profileModal').on('shown.bs.modal', function (e) {
	const firstName = localStorage.getItem("firstName");
	const lastName = localStorage.getItem("lastName");
	const email = localStorage.getItem("email");
	$("#profileFirstName").val(firstName);
	$("#profileLastName").val(lastName);
	$("#profileEmail").val(email);
});

$(document).ready(function() {
	if(localStorage.getItem("loginType") == "local") {
		$("#editProfileMenu").addClass("d-none");
		$("#localLogout").removeClass("d-none");
		$("#profileNameNavbar").text("Wizard");
	}
	else {
		const firstName = localStorage.getItem("firstName");
		$("#profileNameNavbar").text(firstName);
	}
});

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
	$('.website-added').remove();
	$('.new-item').remove();
	$('.form-control').removeClass('is-invalid');
	$("input[type=range]").val(20);
	$("#passwordGeneratorCharactersInfo").text("20");
	$("#editPasswordButton").addClass("d-none");
	$("#editCardButton").addClass("d-none");
	$("#editNoteButton").addClass("d-none");
	$("#totpProgressBar").addClass("d-none");
	setPasswordStrength(true, "#passwordPassword", "#passwordStrength");
	setPasswordStrength(true, "#profilePassword", "#profilePasswordStrength");
	clickEye("#passwordPassword", "#eyePassword", true);
	clickEye("#cardPin", "#eyePin", true);
	clickEye("#profileOldPassword", "#eyeProfileOldPassword", true);
	clickEye("#profilePassword", "#eyeProfilePassword", true);
	clickEye("#profilePasswordConfirm", "#eyeProfilePasswordConfirm", true);
	itemsCounter = 1;
	websiteCounter = 1;
	readOnlyMode = false;
});

/**************************/
/* Utility: generate UUID */
/**************************/

function uuid() {
	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
		(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	);
}

/*********************************/
/* Enable delete button on check */
/*********************************/

function initCheckboxes() {
	const checkboxes = document.querySelectorAll('input[type="checkbox"]');
	const deleteButton = document.getElementById('deleteButton');
	const checkCheckboxes = Array.from(checkboxes).filter(checkbox => checkbox.id.includes('check-'));
	checkCheckboxes.forEach(checkbox => {
		checkbox.addEventListener('change', () => {
			const atLeastOneChecked = checkCheckboxes.some(checkbox => checkbox.checked);
			deleteButton.disabled = !atLeastOneChecked;
		});
	});
}

/************************************/
/* Add custom item in element modal */
/************************************/

const addItemTextElements = document.getElementsByName("addItemText");
const addItemHiddenElements = document.getElementsByName("addItemHidden");

function addItem(itemsCounter, addItemButton, isHidden, write, showField) {
	if(write && readOnlyMode) {
		return;
	}
	var itemIcon = "card-text";
	var itemType = "text";
	var showFieldClass = "";
	if(!showField) {
		showFieldClass = "d-none";
	}
	if(isHidden) {
		itemIcon = "eye-slash";
		itemType = "password";
	}
	var item = "<div class='form-floating mt-3 new-item "+showFieldClass+"'><input type='text' class='form-control rounded-0 rounded-top shadow-none' id='label-"+itemsCounter+"' name='label-"+itemsCounter+"' placeholder='*'><label for='label-"+itemsCounter+"'><svg class='bi me-2'><use xlink:href='./img/bootstrap-icons.svg#tag'/></svg><span data-translate-key=\"vault-new-item-title\">"+translateString("vault-new-item-title")+"</span></label></div>";
	if(!isHidden) {
		item = item + "<div class='form-floating new-item "+showFieldClass+"'><input type='"+itemType+"' class='form-control rounded-0 rounded-bottom border-top-0 shadow-none' id='value-"+itemsCounter+"' name='value-"+itemsCounter+"' placeholder='*'><label for='value-"+itemsCounter+"'><svg class='bi me-2'><use xlink:href='./img/bootstrap-icons.svg#"+itemIcon+"'/></svg><span data-translate-key=\"vault-new-item-value\">"+translateString("vault-new-item-value")+"</span></label></div>";
	}
	else {
		item = item + "<div class='input-group new-item "+showFieldClass+"'><div class='form-floating'><input custom-type='password' type='"+itemType+"' class='form-control rounded-top-0 rounded-bottom-start border-top-0 border-end-0 shadow-none' id='value-"+itemsCounter+"' name='value-"+itemsCounter+"' placeholder='*'><label for='value-"+itemsCounter+"'><svg class='bi me-2'><use xlink:href='./img/bootstrap-icons.svg#"+itemIcon+"'/></svg><span data-translate-key=\"vault-new-item-value\">"+translateString("vault-new-item-value")+"</span></label></div><span class='input-group-text rounded-top-0 bg-eye border-0 border-end border-bottom rounded-bottom-end eye' role='button' wiz-id='"+itemsCounter+"'><svg class='bi mb-0' id='eye-"+itemsCounter+"'><use xlink:href='./img/bootstrap-icons.svg#eye'/></svg></span></div>";
	}
	addItemButton.insertAdjacentHTML("afterend", item);
	itemsCounter = itemsCounter + 1;
	return itemsCounter;
}

addItemTextElements.forEach(function (element) {
	element.addEventListener("click", function () {
		const parentModal = element.closest('.modal.show');
		if (parentModal) {
			const addItemButton = document.getElementById("addItemButton-"+parentModal.id);
			if (addItemButton) {
				itemsCounter = addItem(itemsCounter, addItemButton, false, true, true);
			}
		}
	});
});

addItemHiddenElements.forEach(function (element) {
	element.addEventListener("click", function () {
		const parentModal = element.closest('.modal.show');
		if (parentModal) {
			const addItemButton = document.getElementById("addItemButton-"+parentModal.id);
			if (addItemButton) {
				itemsCounter = addItem(itemsCounter, addItemButton, true, true, true);
				setEye();
			}
		}
	});
});

/*************************************/
/* Add website item in element modal */
/*************************************/

const addWebsiteButton = document.getElementById("addWebsiteButton");
const addWebsiteContainer = document.getElementById("addWebsiteContainer");
const websiteInput = document.getElementById("website-1");
var websiteCounter = 1;

function addWebsite(write, showField) {
	if(readOnlyMode && write) { 
		return;
	}
	showFieldClass = "d-block";
	if(!showField) {
		showFieldClass = "d-none";
	}
	websiteCounter = websiteCounter + 1;
	const newWebsiteInput = websiteInput.cloneNode(true);
	newWebsiteInput.setAttribute("id", "website-" + websiteCounter);
	newWebsiteInput.setAttribute("name", "website-" + websiteCounter);
	newWebsiteInput.classList.add("website-added", "d-flex", "py-0", "align-items-center", "border-top-0", showFieldClass);
	newWebsiteInput.classList.remove("rounded-top");
	newWebsiteInput.value = "";
	addWebsiteContainer.insertBefore(newWebsiteInput, addWebsiteButton);
}

addWebsiteButton.addEventListener("click", function () {
	addWebsite(true, true);
});

/****************************************************/
/* Add space in card number field (card modal only) */
/****************************************************/

document.getElementById('cardNumber').addEventListener('input', function (event) {
	event.target.value = formatCardValue(event.target.value);
});

function formatCardValue(cardNumber) {
	let inputValue = cardNumber.replace(/\s/g, '');
	inputValue = inputValue.replace(/\D/g, '');
	let formattedValue = '';
	for (let i = 0; i < inputValue.length; i++) {
		if (i > 0 && i % 4 === 0) {
			formattedValue += ' ';
		}
		formattedValue += inputValue[i];
	}
	return formattedValue;
}

/***************************************************/
/* Add mask in card number field (card modal only) */
/***************************************************/

function maskString(str) {
	if (str.length < 8) {
		return str;
	}
	const firstFour = str.substring(0, 4);
	const lastFour = str.substring(str.length - 4);
	const middle = str.substring(4, str.length - 4);
	const maskedMiddle = middle.replace(/[^ ]/g, '•');
	return firstFour + maskedMiddle + lastFour;
}

/****************************************************/
/* Validate numeric PIN/CVV field (card modal only) */
/****************************************************/

$('#cardPin, #cardCvv').on('input', function (event) {
	let inputValue = event.target.value.replace(/\D/g, '');
	event.target.value = inputValue;
});

/*******************/
/* Search function */
/*******************/

$(document).ready(function(){
	$("#search, #search-mobile").on("keyup", function() {
		var value = $(this).val().toLowerCase();
			$("#mainTable tr").filter(function() {
			$(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
		});
	});
});

/*******************/
/* Filter function */
/*******************/

function filterTable(container, type = null) {
	$('input[type="checkbox"][name^="check-"]').prop('checked', false);
	$("#noElements").addClass("d-none");
	$("#deleteButton").prop('disabled', true);
	$(".active").removeClass("active");
	$(container).addClass("active");
	var elements = 0;
	var rows = 0;
	$("#mainTable tbody tr").each(function() {
		$(this).removeClass("d-none");
		if(type != null) {
			if (!$(this).hasClass(type)) {
				$(this).addClass("d-none");
			}
			else {
				elements++;
			}
		}
		rows++;
	});
	if((type != null && elements == 0) || rows == 0) {
		$("#noElements").removeClass("d-none");
	}
}

document.getElementById('allFilter').addEventListener('click', function (event) {
	filterTable("#allFilterContainer");
});

document.getElementById('passwordFilter').addEventListener('click', function (event) {
	filterTable("#passwordFilterContainer", "login");
});

document.getElementById('cardFilter').addEventListener('click', function (event) {
	filterTable("#cardFilterContainer", "cards");
});

document.getElementById('noteFilter').addEventListener('click', function (event) {
	filterTable("#noteFilterContainer", "note");
});

/*************************************/
/* Password generator: copy password */
/*************************************/

document.getElementById('copyPassword').addEventListener('click', function (event) {
	var copyText = document.getElementById("generatedPassword");
	copyText.select();
	copyText.setSelectionRange(0, 99999);
	navigator.clipboard.writeText(copyText.value);
	showFeedback(translateString("feedback-title-success"), translateString("vault-feedback-password-clipboard"));
	var historyId = 0;
	for (var i = 0; i < localStorage.length; i++){
		if(localStorage.key(i).includes("history-")) {
			var tmpId = parseInt(localStorage.key(i).split("-")[1]);
			if(tmpId > historyId) {
				historyId = tmpId;
			}
		}
	}
	historyId++;
	secureLocalStorageSetItem("history-"+historyId, copyText.value);
	var element = ["history-"+historyId, copyText.value];
	$("#historyTableBody").prepend(createHistory(element));
	addHistoryCopyListener();
});

/*******************************/
/* Password generator: history */
/*******************************/

function loadHistory() {
	passwordHistory = [];
	for (var i = 0; i < localStorage.length; i++){
		if(localStorage.key(i).includes("history-")) {
			var element = [localStorage.key(i), secureLocalStorageGetItem(localStorage.key(i))];
			passwordHistory.push(element);
		}
	}
	passwordHistory.sort(function(a, b) {
		return (a[0] > b[0]) ? -1 : (a[0] < b[0]) ? 1 : 0;
	});
	return passwordHistory;
}

function clearHistory() {
	var marked = [];
	for (var i = 0; i < localStorage.length; i++){
		if(localStorage.key(i).includes("history-")) {
			marked.push(localStorage.key(i));
		}
	}
	for (var i = 0; i < marked.length; i++){
		localStorage.removeItem(marked[i]);
	}
	$("#historyTableBody").empty();
	addHistoryCopyListener();
	showFeedback(translateString("feedback-title-success"), translateString("vault-feedback-history-deleted"));
}

function addHistoryCopyListener() {
	if($('.copyHistoryButton').length > 0) {
		$("#historyTableEmpty").addClass("d-none");
		$("#historyTable").removeClass("d-none");
	}
	else {
		$("#historyTableEmpty").removeClass("d-none");
		$("#historyTable").addClass("d-none");
	}
	$(".copyHistoryButton").click(function(){
		var wizId = $(this).attr("wiz-id");
		var password = encodeURIComponent(secureLocalStorageGetItem(wizId));
		$('body').append('<input id="copyPasswordType" type="text" class="d-none" value="'+password+'">');
		var copyText = document.getElementById("copyPasswordType");
		copyText.select();
		copyText.setSelectionRange(0, 99999);
		navigator.clipboard.writeText(decodeURIComponent(copyText.value));
		copyText.remove();
		showFeedback(translateString("feedback-title-success"), translateString("vault-feedback-password-clipboard"));
	});
}

function initHistory() {
	const passwordHistory = loadHistory();
	for(var i=0; i<passwordHistory.length; i++) {
		$("#historyTableBody").append(createHistory(passwordHistory[i]));
	}
	
	addHistoryCopyListener();
	
	$("#clearHistoryButton").click(function(){
		clearHistory();
	});
}

function createHistory(passwordHistory) {
	const row = `
		<tr>
			<td class="align-middle"><span role="button" class="btn btn-primary copyHistoryButton" wiz-id="${passwordHistory[0]}"><svg class="bi"><use xlink:href="./img/bootstrap-icons.svg#clipboard"/></svg></span></td>
			<td class="align-middle">${passwordHistory[1]}</td>
		</tr>`
	return row;
}

/*****************************************/
/* Password generator: generate password */
/*****************************************/

const checkbox = document.getElementById('flexSwitchCheckChecked');
const slider = document.getElementById('passwordGeneratorCharacters');
const passwordOutput = document.getElementById('generatedPassword');
const charactersInfo = document.getElementById('passwordGeneratorCharactersInfo');

slider.addEventListener('input', function () {
	const value = this.value;
	charactersInfo.textContent = value;
	passwordOutput.value = generateRandomPassword(value, checkbox.checked);
});

checkbox.addEventListener('change', function () {
	passwordOutput.value = generateRandomPassword(slider.value, checkbox.checked);
});

$(".generatorMenu").on( "click", function() {
	passwordOutput.value = generateRandomPassword(20, true);
});

/***********************************/
/* Read-only mode in element modal */
/***********************************/

$(document).ready(function () { 
	$('#addPasswordModal, #addCardModal, #addNoteModal').on('show.bs.modal', function () {
		var inputs = $(this).find('input, checkbox, textarea');
		var selects = $(this).find('select');
		if(!readOnlyMode) {
			inputs.prop('readonly', false);
			selects.prop('disabled', false);
			inputs.css('cursor', 'auto');
			selects.css('cursor', 'auto');
			$("#addWebsiteButton").removeClass("d-none");
			$(".addOtherFields").removeClass("d-none");
		}
		else {
			inputs.prop('readonly', true);
			selects.prop('disabled', true);
			inputs.css('cursor', 'copy');
			selects.css('cursor', 'copy');
			$("#addWebsiteButton").addClass("d-none");
			$(".addOtherFields").addClass("d-none");
		}				
		inputs.on('click', function () {
			if(!readOnlyMode) {
				return;
			}
			var input = $(this);
			if (input.attr('type') === 'password') {
				var password = encodeURIComponent(input.val());
				$('body').append('<input id="copyPasswordType" type="text" class="d-none" value="'+password+'">');
				var copyText = document.getElementById("copyPasswordType");
				copyText.select();
				copyText.setSelectionRange(0, 99999);
				navigator.clipboard.writeText(decodeURIComponent(copyText.value));
				copyText.remove();
			} else {
				if(input.attr("id") == "cardNumber") {
					var content = encodeURIComponent(input.val());
					content = content.replace(/%20/g, '');
					$('body').append('<input id="copyCardNumber" type="text" value="'+content+'">');
					var copyText = document.getElementById("copyCardNumber");
					copyText.select();
					copyText.setSelectionRange(0, 99999);
					navigator.clipboard.writeText(decodeURIComponent(copyText.value));
					copyText.remove();
				}
				else {
					input.select();
					document.execCommand('copy');
				}
			}
			window.getSelection().removeAllRanges();
			showFeedback(translateString("feedback-title-success"), translateString("vault-feedback-element-clipboard"));
		});
	});
});

/*************************/
/* Elements: create list */
/*************************/

function setMainTable() {
	syncVault();
	$('#newElementButton').prop('disabled', false);
	const credentialsTableBody = $("#mainTableBody");
	for(var i=0; i<localStorage.length; i++) {
		if(localStorage.key(i).includes("element-")) {
			const element = JSON.parse(secureLocalStorageGetItem(localStorage.key(i)));
			const title = element.title;
			const id = element.id;;
			var description = element.username;
			if(element.type == "cards") {
				description = formatCardValue(element.number);
				description = maskString(description);
			}
			if(description == "" || description == undefined) {
				description = translateString("vault-generic-description");
			}
			credentialsTableBody.append(createRow(id, title, description, element.type));
			new Promise(function() {
				setFavicon(id);
			}).then();
		}
	}
	initHistory();
	initDeleteButton();
	initDevices();
	initCheckboxes();
}

function createRow(id, title, description, type) {
	const checkId = "check-"+id;
	var tagColor = "btn-outline-primary";
	var tagIcon = "key";
	var tagTranslation = "vault-sidebar-passwords";
	if(type == "cards") {
		tagColor = "btn-outline-primary";
		tagIcon = "credit-card";
		tagTranslation = "vault-sidebar-cards";
	}
	else if(type == "note") {
		tagColor = "btn-outline-primary";
		tagIcon = "clipboard";
		tagTranslation = "vault-sidebar-notes";
	}
	var tagDescription = translateString(tagTranslation);
	var genericDescription = "";
	if(description == translateString("vault-generic-description")) {
		genericDescription = "data-translate-key=\"vault-generic-description\"";
	}
	const row = `
		<tr class="align-middle ${type}" id="${id}">
			<td><input class="form-check-input shadow-none mx-2" type="checkbox" value="${checkId}" id="${checkId}" name="${checkId}"></td>
			<td onclick="showElement('${id}', true);" role="button"><span id="favicon-${id}"></span><span class="text-theme" id="table-title-${id}">${title}</span><br><span class="small" id="table-description-${id}" ${genericDescription}>${description}</span></td>
			<td onclick="showElement('${id}', true);" role="button"><span class="btn ${tagColor} btn-sm mx-2 pe-none"><svg class="bi"><use xlink:href="./img/bootstrap-icons.svg#${tagIcon}"/></svg><span class="d-none d-md-inline ms-2" data-translate-key="${tagTranslation}">${tagDescription}</span></span></td>
			<td>
				<span class="dropdown">
					<span type="button" data-bs-toggle="dropdown" aria-expanded="false">
						<svg class="bi mx-2"><use xlink:href="./img/bootstrap-icons.svg#three-dots-vertical"/></svg>
					</span>
					<ul class="dropdown-menu">
						<li><a class="dropdown-item" href="#" onclick="showElement('${id}', false);" data-translate-key="vault-element-edit">Modifica</a></li>
						<li><a class="dropdown-item deleteElementButton" href="#" data-bs-toggle="modal" data-bs-target="#deleteModal" wiz-id="${id}" data-translate-key="vault-element-delete">Elimina</a></li>
					</ul>
				</span>
			</td>
		</tr>`
	return row;
}

function syncVault() {
	var currentLocalStorage = [];
	var remoteStorage = [];
	for (var i = 0; i < localStorage.length; i++){
		if(localStorage.key(i).includes("element-")) {
			currentLocalStorage.push(localStorage.key(i));
		}
	}
	
	const elements = loadElements();
	if(elements != "" && elements != undefined) {
		const userElementsData = JSON.parse(elements);
		for(var i=0; i<userElementsData.length; i++) {
			var type = userElementsData[i].type;
			var id = userElementsData[i].id;
			var content = JSON.stringify(userElementsData[i]);
			remoteStorage.push(id);
			var localElement = secureLocalStorageGetItem(id);
			if(!localElement || (localElement && localElement.timestamp < content.timestamp)) {
				secureLocalStorageSetItem(id, content);
			}
		}
	}
	else {
		$("#noElements").removeClass("d-none");
	}
	
	for(var i=0; i<currentLocalStorage.length; i++) {
		if(!remoteStorage.includes(currentLocalStorage[i])) {
			localStorage.removeItem(currentLocalStorage[i]);
		}
	}
}

function loadElements() {
	//return "";
	return '[{"id":"element-1234-5678","timestamp":1695552569,"type":"login","title":"Amazon","username":"example@example.com","password":"la_tua_password_segreta","secret2fa":"JBSWY3DPEHPK3PXP","websites":["https://www.amazon.it","https://www.amazon.de"],"note":"Questo è il tuo account Amazon Italia.","customFields":[{"label":"Numero di telefono","value":"+39 XXX XXXXXXX","type":"text"},{"label":"Indirizzo di spedizione","value":"Via Nome della Via, Numero Civico, CAP Città, Provincia","type":"text"}]},{"id":"element-2","timestamp":1695552569,"type":"login","title":"Skype","username":"example@example.com","password":"la_tua_password_segreta","secret2fa":"il_tuo_codice_2fa","websites":["https://www.skype.com"],"note":"Questo è il tuo account Amazon Italia.","customFields":[{"label":"Numero di telefono","value":"+39 XXX XXXXXXX","type":"text"},{"label":"Indirizzo di spedizione","value":"Via Nome della Via, Numero Civico, CAP Città, Provincia","type":"text"}]},{"id":"element-3","timestamp":1695552569,"type":"cards","title":"Banca Popolare di Sondrio","holder":"Nome Cognome","number":"5355746374848759","expiration":{"month":12,"year":2025},"issuer":"visa","cvv":123,"pin":9876,"note":"Questa è la mia carta di credito.","customFields":[{"label":"Limite di spesa","value":"€5000","type":"text"}]},{"id":"element-4","timestamp":1695552569,"type":"note","title":"Lista della spesa","note":"Queste sono alcune note private.","customFields":[{"label":"Importante","value":"Da non condividere con nessuno.","type":"text"},{"label":"Cifratura","value":"3478573485","type":"hidden"}]}]';
}

/*************************************/
/* Elements: get favicon for website */
/*************************************/

function setFavicon(id) {
	const faviconId = "#favicon-"+id;
	$(faviconId).empty();
	
	for (var i = 0; i < localStorage.length; i++){
		if(localStorage.key(i).includes("element-")) {
			const element = JSON.parse(secureLocalStorageGetItem(localStorage.key(i)));
			if(element.id == id) {
				if(element.type == "cards") {
					if(element.issuer == "visa") {
						appendLogo(faviconId, './img/visa.svg');
					}
					else if(element.issuer == "mastercard") {
						appendLogo(faviconId, './img/mastercard.svg');
					}
					else if(element.issuer == "amex") {
						appendLogo(faviconId, './img/amex.svg');
					}
				}
				else if(element.websites && element.websites.length > 0) {
					for(var c=0; c<element.websites.length; c++) {
						try {
							var url = element.websites[c];
							var parsedURL = new URL(url);
							var hostname = parsedURL.hostname;
							appendLogo(faviconId, 'https://icons.duckduckgo.com/ip3/'+hostname+'.ico');
							break;
						}
						catch(e) {}
					}
					break;
				}
			}
		}
	}
}

function appendLogo(id, url) {
	var img = $("<img>");
	img.attr("src", url);
	img.attr("onerror", "this.style.display='none'");
	img.addClass("element-icon me-3");
	$(id).append(img);
}

/*******************/
/* Elements: click */
/*******************/

function showElement(id, readOnly) {
	readOnlyMode = readOnly;
	if(readOnly) {
		$("#editPasswordButton").removeClass("d-none");
		$("#editCardButton").removeClass("d-none");
		$("#editNoteButton").removeClass("d-none");
	}
	else {
		$("#editPasswordButton").addClass("d-none");
		$("#editCardButton").addClass("d-none");
		$("#editNoteButton").addClass("d-none");
	}
	var type;
	var element;
	
	for (var i = 0; i < localStorage.length; i++){
		if(localStorage.key(i).includes("element-")) {
			var tmpElement = JSON.parse(secureLocalStorageGetItem(localStorage.key(i)));
			if(tmpElement.id == id) {
				type = tmpElement.type;
				element = tmpElement;
			}
		}
	}
	
	if(type == "login") {
		var totp = element.secret2fa;
		if(readOnlyMode) {
			totp = generateTotp(element.secret2fa);
			if(totp != "") {
				$("#totpProgressBar").removeClass("d-none");
			}
		}
		$("#title-addPasswordModal").val(element.title);
		$("#passwordUsername").val(element.username);
		$("#passwordPassword").val(element.password);
		setPasswordStrength(false, "#passwordPassword", "#passwordStrength");
		$("#password2fa").val(totp);
		$("#passwordNote").val(element.note);
		$("#totpSeed").val(element.secret2fa);
		var i = 1;
		if(element.websites) {
			for(i=1; i<=element.websites.length; i++) {
				var showField = true;
				if(element.websites[i-1] == "") {
					showField = false;
				}
				if(i != 1) {
					addWebsite(false, showField);
				}
				$("#website-"+i).val(element.websites[i-1]);
			}
		}
		websiteCounter = i;
		const addItemButton = document.getElementById("addItemButton-addPasswordModal");
		setCustomFields(element, addItemButton);
		$("#editPasswordId").val(element.id);
		$("#addPasswordModal").modal("show");
	}
	else if(type == "cards") {
		$("#title-addCardModal").val(element.title);
		$("#cardHolder").val(element.holder);
		$("#cardNumber").val(formatCardValue(element.number));
		$("#cardExpirationMonth").val(element.expiration.month);
		$("#cardExpirationYear").val(element.expiration.year);
		$("#cardIssuer").val(element.issuer);
		$("#cardCvv").val(element.cvv);
		$("#cardPin").val(element.pin);
		$("#cardNote").val(element.note);
		const addItemButton = document.getElementById("addItemButton-addCardModal");
		setCustomFields(element, addItemButton);
		$("#editCardId").val(element.id);
		$("#addCardModal").modal("toggle");
	}
	else if(type == "note") {
		$("#title-addNoteModal").val(element.title);
		$("#noteNote").val(element.note);
		const addItemButton = document.getElementById("addItemButton-addNoteModal");
		setCustomFields(element, addItemButton);
		$("#editNoteId").val(element.id);
		$("#addNoteModal").modal("toggle");
	}
}

function setCustomFields(element, addItemButton) {
	var i = 0;
	if(element.customFields) {
		for(i=0; i<element.customFields.length; i++) {
			var isHidden = false;
			var showField = true;
			if(element.customFields[i].type == "hidden") {
				isHidden = true;
			}
			if(element.customFields[i].label == "" && element.customFields[i].value == "") {
				showField = false;
			}
			addItem(i, addItemButton, isHidden, false, showField);
			$("#label-"+i).val(element.customFields[i].label);
			$("#value-"+i).val(element.customFields[i].value);
		}
	}
	itemsCounter = i;
	setEye();
}

/********************/
/* Elements: delete */
/********************/

function setDeleteButton() {
	$(".deleteElementButton").click(function(){
		var wizId = $(this).attr("wiz-id");
		$("#deleteElementId").val(wizId);
	});
}

function initDeleteButton() {
	setDeleteButton();
	$("#deleteElement").click(function(){
		deleteElement($("#deleteElementId").val());
	});
	$("#deleteMultipleButton").click(function(){
		var elementIds = [];
		var selectedCheckboxes = $("input[type='checkbox']:checked[id^='check-']");
		selectedCheckboxes.each(function() {
			var checkbox = $(this);
			var checkboxId = checkbox.attr("id");
			localStorage.removeItem(checkboxId.replace("check-", ""));
			elementIds.push(checkboxId.replace("check-", ""));
			var row = checkbox.closest("tr");
			row.remove();
			localStorage.removeItem(elementIds);
		});
		$("#deleteButton").prop('disabled', true);
		if($('#mainTable tr').length == 0 || $("#mainTable tr.d-none").length == $('#mainTable tr').length) {
			$("#noElements").removeClass("d-none");
		}
		deleteElements(elementIds);
	});
}

function deleteElement(id) {
	$('#'+id).remove();
	localStorage.removeItem(id);
	$("#deleteButton").prop('disabled', true);
	if($('#mainTable tr').length == 0 || $("#mainTable tr.d-none").length == $('#mainTable tr').length) {
		$("#noElements").removeClass("d-none");
	}
	var elementIds = [];
	elementIds.push(id);
	deleteElements(elementIds);
}

function deleteElements(ids) {
	/* TODO */
	// Chiamata AJAX al Server
}

/******************/
/* Elements: edit */
/******************/

function hideModalWithPromise(modalId) {
	return new Promise(function(resolve, reject) {
		$(modalId).modal("hide").on("hidden.bs.modal", function() {
			resolve();
		});
	});
}

$(document).ready(function() {
	$("#editPasswordButton").click(function(){
		var id = $("#editPasswordId").val();
		hideModalWithPromise("#addPasswordModal").then(function() {
			showElement(id, false);
		}).catch(function(error) {});
	});
	$("#editCardButton").click(function(){
		var id = $("#editCardId").val();
		hideModalWithPromise("#addCardModal").then(function() {
			showElement(id, false);
		}).catch(function(error) {});
	});
	$("#editNoteButton").click(function(){
		var id = $("#editNoteId").val();
		hideModalWithPromise("#addNoteModal").then(function() {
			showElement(id, false);
		}).catch(function(error) {});
	});
	
	$("#confirmPasswordButton").click(function(){
		saveElement($("#editPasswordId").val(), "addPasswordModal");
	});
	$("#confirmCardButton").click(function(){
		saveElement($("#editCardId").val(), "addCardModal");
	});
	$("#confirmNoteButton").click(function(){
		saveElement($("#editNoteId").val(), "addNoteModal");
	});
});

function saveElement(id, modalId) {
	const title = document.getElementById("title-"+modalId);
	var elementFound = false;
	var element = [];
	if(!title || (title && title.value.length == 0)) {
		$('#title-'+modalId).addClass('is-invalid');
		showFeedback(translateString("feedback-title-error"), translateString("vault-feedback-title-error"));
		return;
	}
	for (var i = 0; i < localStorage.length; i++){
		if(localStorage.key(i).includes("element-")) {
			var tmpElement = JSON.parse(secureLocalStorageGetItem(localStorage.key(i)));
			if(tmpElement.id == id) {
				elementFound = true;
				element = tmpElement;
				break;
			}
		}
	}
	if(!elementFound) {
		id = "element-"+uuid();
		element.id = id;
		var type;
		if(modalId == "addPasswordModal") {
			type = "login";
			element.type = "login";
			element.websites = [];
		}
		else if(modalId == "addCardModal") {
			type = "cards";
			element.type = "cards";
			element.expiration = [];
		}
		else if(modalId == "addNoteModal") {
			element.type = "note";
			type = "note";
		}
	}
	var description;
	element.timestamp = Date.now();
	if(element.type == "login") {
		element.title = $("#title-addPasswordModal").val();
		element.username = $("#passwordUsername").val();
		element.password = $("#passwordPassword").val();
		element.secret2fa = $("#password2fa").val();
		element.note = $("#passwordNote").val();
		element.websites = [];
		var elementsWithLabelId = $("#"+modalId+" [id^='website-']");
		var w = 0;
		elementsWithLabelId.each(function() {
			var id = "#"+$(this).attr('id');
			var website = $(id).val();
			if(website != "") {
				element.websites[w] = $(id).val();
				w++;
			}
		});
		description = element.username;
	}
	else if(element.type == "cards") {
		element.title = $("#title-addCardModal").val();
		element.holder = $("#cardHolder").val();
		element.number = $("#cardNumber").val().replace(/\s/g, '');
		element.expiration.month = $("#cardExpirationMonth").val();
		element.expiration.year = $("#cardExpirationYear").val();
		element.issuer = $("#cardIssuer").val();
		element.cvv = $("#cardCvv").val();
		element.pin = $("#cardPin").val();
		element.note = $("#cardNote").val();
		description = element.number;
		description = formatCardValue(description);
		description = maskString(description);
	}
	else if(element.type == "note") {
		element.title = $("#title-addNoteModal").val();
		element.note = $("#noteNote").val();
	}
	var labelsWithLabelId = $("#"+modalId+" [id^='label-']");
	var customFields = [];
	labelsWithLabelId.each(function() {
		var id = "#"+$(this).attr('id');
		var uniqueId = id.replace("#label-", "");
		var fieldType = "";
		if($("#value-"+uniqueId).attr("custom-type") == "password") {
			fieldType = "hidden";
		}
		else {
			fieldType = "text";
		}
		var fieldLabel = $(id).val();
		var fieldValue = $("#value-"+uniqueId).val();
		if(fieldLabel != "" || fieldValue != "") {
			customFields.push({label:fieldLabel, value:fieldValue, type:fieldType});
		}
	});
	console.log(customFields);
	element.customFields = customFields;
	$("#table-title-"+id).text(element.title);
	if(description == "" || description == undefined) {
		description = translateString("vault-generic-description");
	}
	if(!elementFound) {
		$("#mainTableBody").append(createRow(id, element.title, description, type));
		$("#noElements").addClass("d-none");
	}
	secureLocalStorageSetItem(element.id, JSON.stringify({...element}));
	$("#table-description-"+id).text(description);
	$("#"+modalId).modal("hide");
	setFavicon(id);
	setDeleteButton();
	initCheckboxes();
}

/************************/
/* Devices: create list */
/************************/

function loadDevices() {
	return '[{"id":1,"useragent":"Windows 11 - Chrome 116","type":"extension"}, {"id":2,"useragent":"iPhone X - Safari Web Browser","type":"browser"}, {"id":3,"useragent":"Pixel 5 - Android App","type":"mobile"}]';
}

function initDevices() {
	const devicesTableBody = $("#devicesTableBody");
	const devices = JSON.parse(loadDevices());
	for(var i=0; i<devices.length; i++) {
		devicesTableBody.append(createDevice(devices[i].id, devices[i].useragent, devices[i].type));
	}
}

function createDevice(id, userAgent, type) {
	var tagColor = "btn-outline-primary";
	var tagIcon = "globe-americas";
	var tagTranslation = "vault-device-type-web-browser";
	if(type == "extension") {
		tagColor = "btn-outline-primary";
		tagIcon = "code-square";
		tagTranslation = "vault-device-type-browser-extension";
	}
	else if(type == "mobile") {
		tagColor = "btn-outline-primary";
		tagIcon = "phone";
		tagTranslation = "vault-device-type-mobile-app";
	}
	var tagDescription = translateString(tagTranslation);
	const row = `
		<tr id="device-${id}">
			<td class="align-middle text-theme">${userAgent}</td>
			<td class="align-middle"><span class="btn ${tagColor} btn-sm mx-2 pe-none"><svg class="bi"><use xlink:href="./img/bootstrap-icons.svg#${tagIcon}"/></svg><span class="d-none d-md-inline ms-2" data-translate-key="${tagTranslation}">${tagDescription}</span></td>
			<td class="align-middle"><span class="btn btn-danger deleteDeviceButton" role="button" data-bs-toggle="modal" data-bs-target="#deleteDeviceModal" wiz-id="${id}"><svg class="bi"><use xlink:href="./img/bootstrap-icons.svg#trash3" /></svg></span></td>
		</tr>`
	return row;
}

/*******************/
/* Devices: delete */
/*******************/

$(document).ready(function() {
	$(".deleteDeviceButton").click(function(){
		var wizId = $(this).attr("wiz-id");
		$("#deleteDeviceId").val(wizId);
	});
	$("#deleteDevice").click(function(){
		const id = $("#deleteDeviceId").val();
		$('#device-'+id).remove();
		deleteDevice(id);
	});
});

function deleteDevice(id) {
	/* TODO */
	// Chiamata AJAX al Server
}

/***************/
/* Block vault */
/***************/

$(document).ready(function() {
	$("#blockVaultMenu").click(function(){
		showLoader(true);
		sessionStorage.clear();
		window.location.replace("./unlock.html");
	});
});

/****************/
/* Edit profile */
/****************/

$("#editProfileButton").click(function(){
	var firstName = $("#profileFirstName");
	var lastName = $("#profileLastName");
	var email = $("#profileEmail");
	var oldPassword = $("#profileOldPassword");
	var password = $("#profilePassword");
	var passwordConfirm = $("#profilePasswordConfirm");
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
		$("#profileModal").modal("hide");
		//showLoader(true);
	}
});

function editProfile(firstName, lastName, email, oldMasterPasswordHash, masterPasswordHash, magicPassword) {
	/* TODO */
	// Chiamata AJAX al Server
	showLoader(false);
	showFeedbackModal("Registrazione completata", "Benvenuto a bordo! Controlla il tuo indirizzo email, ti abbiamo inviato le istruzioni per attivare il tuo account.");
}

/******************/
/* Delete profile */
/******************/

$("#deleteProfileButton").click(function(){
	$("#deleteProfileModal").modal("hide");
	showLoader(true);
	/* TODO */
	// Chiamata AJAX al Server
	$("#logoutButton").click();
});

/*********************/
/* TOTP progress bar */
/*********************/

$('#totpDuration').on('animationend', function() {
	if(readOnlyMode) {
		var totp = generateTotp($("#totpSeed").val());
		$("#password2fa").val(totp);
		$("#totpDuration").removeClass("progress-bar-totp");
		$("#totpDuration").width();
		$("#totpDuration").addClass("progress-bar-totp");
	}
});

/*********************/
/* Password strength */
/*********************/

$(document).ready(function() {
	$("#passwordPassword").on("input", function() {
		setPasswordStrength(false, "#passwordPassword", "#passwordStrength");
	});
	$("#profilePassword").on("input", function() {
		setPasswordStrength(false, "#profilePassword", "#profilePasswordStrength");
	});
});


/**********************/
/* Show/hide password */
/**********************/

$(document).ready(function() {
	$("#passwordEye").click(function(){
		clickEye("#passwordPassword", "#eyePassword", false);
	});
	$("#pinEye").click(function(){
		clickEye("#cardPin", "#eyePin", false);
	});
	$("#profileOldPasswordEye").click(function(){
		clickEye("#profileOldPassword", "#eyeProfileOldPassword", false);
	});
	$("#profilePasswordEye").click(function(){
		clickEye("#profilePassword", "#eyeProfilePassword", false);
	});
	$("#profilePasswordConfirmEye").click(function(){
		clickEye("#profilePasswordConfirm", "#eyeProfilePasswordConfirm", false);
	});
});