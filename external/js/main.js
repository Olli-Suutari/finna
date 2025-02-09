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

function homeLibFunctionality() {
	var container = document.getElementById('libFrame');
	// Add transition style for smooth height adjustments.
	var css = document.createElement('style');
	css.type = 'text/css';
	css.innerHTML = '#libFrame { transition: height 500ms;}';
	document.head.appendChild(css);
	// Event listener for messages from the iframe.
	window.addEventListener('message', function (event) {
		var data = event.data;
		// Resize the window.
		if (data.type === 'resize') {
			var height = data.value;
			// For some reason, item height is reported incorrectly based on resolution... TO DO: Less hacky fix.
			var itemWidth = window.innerWidth;
			var heightOffset = 50;
			if (itemWidth < 370) {
				heightOffset = 245;
			} else if (itemWidth < 470) {
				heightOffset = 200;
			} else if (itemWidth < 611) {
				heightOffset = 180;
			} else if (itemWidth < 768) {
				heightOffset = 170;
			} else if (itemWidth < 1340) {
				heightOffset = 190;
			}
			height = height + 50;
			// Minimum height of 520.
			if (height < 520) {
				height = 520;
			}
			if ($(window).width() > 767) {
				setTimeout(function () {
					// Carousel height of keskikirjastot homepage.
					var newsHeight = $('#keskiNewsUl').height();
					newsHeight = $('.news-page-link-container').height() + newsHeight;
					newsHeight = Math.floor(newsHeight);
					var iframeHeight = $('#libFrame').height();
					if (iframeHeight < newsHeight) {
						// If schedules are 120px or less smaller than news, make them equal. // TO DO; Does fix the UI as the btn position is not fixed to bottom.
						if (newsHeight - iframeHeight < 140) {
							height = newsHeight + 17;
							$('#libFrame').css('height', height + 'px');
							$('#libFrame').attr('height', height + 'px');
						}
					}
				}, 1000);
			}
			container.style.height = height + 'px';
		}
		// Redirect to libraries page.
		else if (data.type === 'redirect') {
			try {
				window.location.href = data.value;
			} catch (e) {
				console.log('Redirect failed: ' + e);
			}
		}
	});
}

function decodeVal(value) {
	if (!isValue(value)) {
		return value;
	}
	value = decodeURI(value);
	value = value.toLowerCase();
	/*
    value = value.replace(/,/g, "");
    //value = value.replace(/ /g, "-");
    value = value.replace(/ä/g, "a");
    value = value.replace(/ö/g, "o");
    value = value.replace(/\(/g, "");
    value = value.replace(/\)/g, "");
    // // ?%2525253f | Such strings are generated by bugged Drupal from multiple ? such as ?library?service.
    if(value.indexOf('%3f') > -1) {
        value = value.replace('%3f', '?')
    }
     */
	return value;
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
	} else {
		return false;
	}
}

// Load tilefallback
if (!window.tileLayer) {
	console.log('Load Leaflet tile fallback.');
	importJsOrCssFile('https://keski-finna.fi/external/finna/js/dist/leaflet.tilelayer.fallback.js', 'js');
}
// Load JQuery Translate.
if (!window.i18n) {
	if (locationUrl.indexOf('a-pre.fi') > -1) {
		require('https://keski-finna.fi/external/finna/js/jquery.translate.js', loadPolyfills());
	} else {
		require('https://keski-finna.fi/external/finna/js/dist/jquery.translate.js', loadPolyfills());
	}
}

function loadPolyfills() {
	if (navigator.userAgent.indexOf('MSIE ') > -1 || navigator.userAgent.indexOf('Trident/') > -1) {
		require('https://polyfill.io/v3/polyfill.min.js?features=es2015%2Ces2016%2Ces2017%2Ces5%2Ces6%2CArray.prototype.includes%2CString.prototype.includes%2Cdefault%2Cblissfuljs%2CArray.of%2CArray.prototype.some%2CNumber.EPSILON%2Cdocument%2CArray.prototype.every%2CArray.prototype.fill%2CArray.prototype.filter%2CArray.prototype.find%2CArray.prototype.forEach%2CArray.prototype.reduce%2CArray.prototype.lastIndexOf%2CArray.prototype.indexOf%2CscrollIntoView%2CscrollX%2CscrollY%2CArray.isArray%2CArray.from%2Ces7%2Ces2019%2Ces2018', loadContentScripts());
	} else {
		loadContentScripts();
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

var isIOS = false;
// https://stackoverflow.com/questions/7944460/detect-safari-browser
var testSafari =
	navigator.vendor &&
	navigator.vendor.indexOf('Apple') > -1 &&
	navigator.userAgent &&
	navigator.userAgent.indexOf('CriOS') == -1 &&
	navigator.userAgent.indexOf('FxiOS') == -1;
if (testSafari || /^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
	isIOS = true;
}
// https://stackoverflow.com/questions/4617638/detect-ipad-users-using-jquery
var isIPad = navigator.userAgent.match(/iPad/i) != null;
var isIPhone = navigator.userAgent.match(/iPhone/i) != null || navigator.userAgent.match(/iPod/i) != null;
if (isIPad || isIPhone) {
	isIOS = true;
}

function require(url, callback) {
	var e = document.createElement('script');
	e.src = url;
	e.type = 'text/javascript';
	e.addEventListener('load', callback);
	document.getElementsByTagName('head')[0].appendChild(e);
}
if ($('.keski-news-home').length === 1) {
	homeLibFunctionality();
}

function main() {
	if ($('.keski-news-home').length === 1) {
		homeLibFunctionality();
	}
}

$(document).ready(function () {
	main();
});
