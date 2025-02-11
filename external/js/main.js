var locationUrl = '';
locationUrl = window.location.href;

function importJsOrCssFile(filename, filetype) {
	if (filetype == 'js') {
		// if filename is a external JavaScript file
		var fileref = document.createElement('script');
		fileref.setAttribute('type', 'text/javascript');
		fileref.setAttribute('src', filename);
	} else if (filetype == 'css') {
		// if filename is an external CSS file
		var fileref = document.createElement('link');
		fileref.setAttribute('rel', 'stylesheet');
		fileref.setAttribute('type', 'text/css');
		fileref.setAttribute('href', filename);
	}
	if (typeof fileref != 'undefined') document.getElementsByTagName('head')[0].appendChild(fileref);
}

// Check if provided value is not null, undefined or empty
function isValue(value) {
	if (
		(value !== null &&
			value !== undefined &&
			value.length !== 0 &&
			!isNaN(value) &&
			value !== 'NaN' &&
			value !== 'undefined') ||
		$.trim(value) !== ''
	) {
		if (typeof value == 'number') {
			return true;
		}
		var valueWithoutPTags = value.replace(/<p>/g, '');
		valueWithoutPTags = valueWithoutPTags.replace(/<\/p>/g, '');
		valueWithoutPTags = $.trim(valueWithoutPTags);
		return valueWithoutPTags.length >= 1;
	}
	return false;
}

function decodeVal(value) {
	if (!isValue(value)) {
		return value;
	}
	value = decodeURI(value);
	value = value.toLowerCase();
	return value;
}

// Load JQuery Translate and callback news.
if (!window.i18n) {
	if (locationUrl.indexOf('a-pre.fi') > -1) {
		require('https://keski-finna.fi/external/finna/js/jquery.translate.js', loadContentScripts());
	} else {
		require('https://keski-finna.fi/external/finna/js/dist/jquery.translate.js', loadContentScripts());
	}
}

function loadContentScripts() {
	setTimeout(function () {
		if (locationUrl.indexOf('a-pre.fi') > -1) {
			importJsOrCssFile('https://keski-finna.fi/external/finna/js/newsTest.js', 'js');
			return;
		}
		importJsOrCssFile('https://keski-finna.fi/external/finna/js/dist/news.js', 'js');
	}, 1400);
}

function require(url, callback) {
	var e = document.createElement('script');
	e.src = url;
	e.type = 'text/javascript';
	e.addEventListener('load', callback);
	document.getElementsByTagName('head')[0].appendChild(e);
}
