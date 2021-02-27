/* Add your custom template javascript here */
var locationUrl = '';
locationUrl = window.location.href;

function importJsOrCssFile(filename, filetype) {
	if (filetype == 'js') {
		//if filename is a external JavaScript file
		var fileref = document.createElement('script');
		fileref.setAttribute('type', 'text/javascript');
		fileref.setAttribute('src', filename);
	} else if (filetype == 'css') {
		//if filename is an external CSS file
		var fileref = document.createElement('link');
		fileref.setAttribute('rel', 'stylesheet');
		fileref.setAttribute('type', 'text/css');
		fileref.setAttribute('href', filename);
	}
	if (typeof fileref != 'undefined') document.getElementsByTagName('head')[0].appendChild(fileref);
}

// Function for checking if page exists and redirecting accordingly.
function checkUrlForContent(url) {
	try {
		$.get(url, function () {
			window.location = url;
		});
	} catch (e) {
		// Page not found... console.log(e)
	}
}

// Turn link into an _blank and set class + accessibility text.
function generateAccessibleExternalLink(link) {
	//if (link.indexOf('@') !== -1) {
	//    return
	//}
	var opensInNewTabText = 'avautuu uudessa välilehdessä';

	if (document.documentElement.lang.toLowerCase() !== 'fi') {
		opensInNewTabText = 'opens in a new tab';
	}

	link.insertAdjacentHTML('beforeend', '<span class="sr-only"> (' + opensInNewTabText + ')</span>');

	return link;
}
// https://codersblock.com/blog/external-links-new-tabs-and-accessibility/
function addNoOpener(link) {
	let linkTypes = (link.getAttribute('rel') || '').split(' ');
	if (!linkTypes.includes('noopener')) {
		linkTypes.push('noopener');
	}
	link.setAttribute('rel', linkTypes.join(' ').trim());
}

function appendSearchBar() {
	if (locationUrl.indexOf('/Search/Advanced') > -1 || $('.adv_search_links').length) {
		// If we use display none or remove the whole search bar, advanced search help tooltip won't work.
		$('section[role=search] .search-form-container').removeClass('search-form-container');
		$('section[role=search]').css('visibility', 'hidden');
		$('section[role=search]').removeClass('searchContent');
		$('section[role=search]').removeAttr('role');
		return;
	}
	if (locationUrl.toLowerCase().indexOf('/content/help') > -1) {
		$('#searchHelpLink').parent().css('display', 'none');
	}
	if (locationUrl.indexOf('/Search/History') > -1) {
		$('.history-btn').parent().css('display', 'none');
		return;
	}
}

function addSelectedNav() {
	if (locationUrl.indexOf('/Content/kirjastot') > -1) {
		$('header li a[href$="/kirjastot"]').addClass('selected-nav');
	} else if (locationUrl.indexOf('/Content/info') > -1) {
		$('header li a[href$="/info"]').addClass('selected-nav');
	} else if (locationUrl.indexOf('/Content/help_opac') > -1) {
		$('header li a[href$="/info"]').addClass('selected-nav');
	} else if (locationUrl.indexOf('/Content/help_accessibility') > -1) {
		$('header li a[href$="/info"]').addClass('selected-nav');
	} else if (locationUrl.indexOf('/Content/help_keski') > -1) {
		$('header li a[href$="/info"]').addClass('selected-nav');
	} else if (locationUrl.indexOf('/Feedback/Home') > -1) {
		$('header li a[href$="/Feedback/Home"]').addClass('selected-nav');
	} else if (locationUrl.indexOf('/Content/accessibility-statement') > -1) {
		$('footer li a[href$="/Content/accessibility-statement"]').parent().addClass('selected-nav');
	} else {
		// Tips might contain urls similar to search results
		if (locationUrl.indexOf('/Search/Results') > -1 || locationUrl.indexOf('/Record/') > -1) {
			return;
		}
		$('#menu_Vinkit a').each(function () {
			//do something with the link element
			if (locationUrl.indexOf(this.href) > -1) {
				$('#menu_Vinkit').addClass('selected-nav');
				var linkEnding = this.href.substring(this.href.lastIndexOf('/') + 1);
				$('#menu_Vinkit li a[href$="' + linkEnding + '"]').addClass('selected-nav');
			}
		});
		$('#menu_eaineisto a').each(function () {
			//do something with the link element
			if (locationUrl.indexOf(this.href) > -1) {
				$('#menu_eaineisto').addClass('selected-nav');
				var linkEnding = this.href.substring(this.href.lastIndexOf('/') + 1);
				$('li a[href$="' + linkEnding + '"]').addClass('selected-nav');
			}
		});
		// Footer links
		$('footer a').each(function () {
			//do something with the link element
			if (locationUrl.indexOf(this.href) > -1) {
				$('li a[href$="' + window.location.pathname + '"]').addClass('selected-nav');
			}
		});

		/*
     if (locationUrl.indexOf('/Content/terms') > -1) {
            $('footer li a[href$="/Content/terms"]').parent().addClass("selected-nav");
        }
        else if (locationUrl.indexOf('/Content/privacy') > -1) {
            $('footer li a[href$="/Content/privacy"]').parent().addClass("selected-nav");
        }
        */
	}
}

function leftNavigationScrollDisplay() {
	if ($('.content-navigation-menu').length) {
		$('.content-navigation-menu h2 a').first().parent().addClass('selected-sub-nav');
		var navSections = [];
		$('.content-navigation-menu h2 a').each(function () {
			try {
				var selector = $(this.hash)[0].id;
				if (selector !== undefined) {
					//selector = selector.substr(1);
					navSections.push(selector);
				}
			} catch (e) {
				// Error.
			}
		});
		var navSectitionsWithPos = [];
		for (i = 0; i < navSections.length; i++) {
			var position = window.scrollY + document.getElementById(navSections[i]).getBoundingClientRect().top;
			navSectitionsWithPos.push({ id: navSections[i], pos: position });
		}

		var navSectitionsWithPosEnd = [];
		for (i = 0; i < navSectitionsWithPos.length; i++) {
			var positionEnd = 99999999;
			if (i < navSectitionsWithPos.length - 1) {
				positionEnd = navSectitionsWithPos[i + 1].pos;
			}
			// Add end pos + adjusted -+ 80px to accommodate margins.
			navSectitionsWithPosEnd.push({
				id: navSectitionsWithPos[i].id,
				pos: navSectitionsWithPos[i].pos - 80,
				posEnd: positionEnd + 80
			});
		}

		// Reference: http://www.html5rocks.com/en/tutorials/speed/animations/
		let last_known_scroll_position = 0;
		let ticking = false;
		function checkActiveSubNav(scroll_pos) {
			// Do something with the scroll position
			for (i = 0; i < navSectitionsWithPosEnd.length; i++) {
				if (scroll_pos >= navSectitionsWithPosEnd[i].pos && scroll_pos <= navSectitionsWithPosEnd[i].posEnd) {
					$('.selected-sub-nav').removeClass('selected-sub-nav');
					var newSelected = $('h2 a[href$="#' + navSectitionsWithPosEnd[i].id + '"');
					newSelected.parent().addClass('selected-sub-nav');
				}
			}
		}
		// Add/remove selected nav element class based on scroll pos.
		window.addEventListener('scroll', function (e) {
			last_known_scroll_position = window.scrollY;
			if (!ticking) {
				window.requestAnimationFrame(function () {
					checkActiveSubNav(last_known_scroll_position);
					/* There is a bug in the attached navigation where the position of the element would start jumping after scrolling upwards from the bottom with some screen sizes.
                    // This fixes the issue by setting the top position to 0 instead of "auto" as set by Finna.
                    // If we are at the bottom of the page "bottom x px" style is applied to the navigation (to prevent overflow), thus top should be "auto".
                    // TO DO: This fix has issues on certain resolutions, find a better fix.
                    var bottomPos = $('.attached').css('bottom');
                    if (bottomPos != undefined) {
                        bottomPos = bottomPos.replace('px', '');
                        console.log(bottomPos)
                        if (bottomPos > 0 && bottomPos > 100) {
                            //$('.attached').css('top', 'auto');
                            //$('.attached').css('top',  bottomPos + 'px');
                        }
                        else {
                            //$('.attached').css('top', '0');
                        }
                    }
                    */
					ticking = false;
				});
				ticking = true;
			}
		});
	}
}

function addClassesToAvailableOnWebFilter() {
	// "Verkossa saatavilla" does not have .title-value-pair, and thus no styling.
	$('.filter-value').each(function (index) {
		if (!$(this).hasClass('filters-and') && !$(this).hasClass('filters-or')) {
			!$(this).addClass('title-value-pair');
			!$(this).removeClass('filter-value');
		}
	});
}

// Function for displaying last page number if more than 5 pages remain and hiding prev/next navigations if on 2nd last/first pages.
function smartPaginationDisplay() {
	var totalResults = $('.pagination-text .total').text();
	if (totalResults != '') {
		//$('.sort-option-container').prepend('<span class="total-count">' + totalResults + ' hakutulosta</span>');
	}

	// Remove "Näytetään"
	$('.pagination-text span').each(function (index) {
		var value = $(this).text();
		if (value == 'Näytetään ' || value == 'Showing ' || value == ' results of ') {
			$(this).css('display', 'none');
		}
		var strong = $(value + 'strong');
		if (strong === ' results of ') {
			$(this).css('display', 'none');
		}
	});
	var replaced = $('.pagination-text').html().replace(' results of ', ' / ');
	$('.pagination-text').html(replaced);
	// Remove space in 41-60.
	$('.pagination-text strong').each(function (index) {
		var value = $(this).text();
		value = value.replace(/ /g, '');
		$(this).text(value);
	});
	$('.pagination-container').css('visibility', 'visible');
	$('.sort-option-container .sort-button span').prepend('<span class="sort-by">' + i18n.get('Order') + ':</span>');
	$('.limit-option-container .sort-button span').prepend(
		'<span class="results-on-page">' + i18n.get('Show') + ':</span>'
	);
	$('.control-container .view-dropdown .dropdown-toggle').prepend(
		'<span class="results-on-page">' + i18n.get('View') + ':</span>'
	);

	if ($('.fa-last-page').length) {
		var parentLink = $('.fa-last-page').parent();
		//var matchPageNum = new RegExp('\page=\d*/g');
		var matchPageNum = new RegExp(/page=\d*/g);
		var totalPages = matchPageNum.exec(parentLink[0]);
		totalPages = totalPages[0].replace('page=', '');
		// Unless we re-init the RegExp, it will be null.
		matchPageNum = new RegExp(/page=\d*/g);
		var currentPage = matchPageNum.exec(locationUrl);
		if (currentPage == null) {
			currentPage = 0;
		} else {
			currentPage = currentPage[0].replace('page=', '');
		}
		var pagesLeft = totalPages - currentPage;
		if ($(window).width() < 475) {
			$('.pagination .fa-arrow-alt-right').parent().css('display', 'none');
			if (currentPage != 2) {
				$('.pagination .fa-arrow-alt-left').parent().css('display', 'none');
			}
		}
		if (pagesLeft > 2) {
			$('.fa-last-page').prepend(' ' + totalPages);
		} else if (pagesLeft < 2) {
			$('.fa-arrow-alt-right').addClass('fa-last-page');
			$('.fa-arrow-alt-right').removeClass('fa-arrow-alt-right');
			$(parentLink).parent().css('display', 'none');
		}
		if (currentPage == 2) {
			$('.pagination .fa-first-page').parent().css('display', 'none');
			$('.fa-arrow-alt-left').addClass('fa-first-page');
			$('.fa-arrow-alt-left').removeClass('fa-arrow-alt-left');
		}
	}
	// Hide "Keski-kirjastot" from the selected library filter text.
	if (document.documentElement.lang.toLowerCase() === 'fi') {
		if ($('.filter-text:contains("Keski-kirjastot")')) {
			// Unless we apply the contains filter, other filter texts will also be replaced.
			$('.filter-text').each(function (index) {
				var newValue = $(this).text();
				newValue = newValue.replace('Keski-kirjastot > ', '');
				$(this).text(newValue);
			});
		}
	} else {
		if ($('.filter-text:contains("Keski Libraries")')) {
			$('.filter-text').each(function (index) {
				var newValue = $(this).text();
				newValue = newValue.replace('Keski Libraries > ', '');
				$(this).text(newValue);
			});
		}
	}
	addClassesToAvailableOnWebFilter();
	// Hide "Verkossa saatavilla" if none are available && not filtered already.
	var webCount = $('div [data-facet="online_boolean:1"] .avail-count').text();
	if (window.location.href.indexOf('online_boolean') === -1 && webCount == 0) {
		$('div [data-facet="online_boolean:1"]').parent().parent().css('display', 'none');
	}
	// Hide subtitle language if none are available.
	var toggleSubLang = $('#side-panel-subtitle_lng_str_mv .collapsed');
	$(toggleSubLang).click();
	setTimeout(function () {
		var subLang = $('#side-collapse-subtitle_lng_str_mv .list-group-item').text();
		if (subLang == 'Ei tietoja' || subLang == 'No data available') {
			$('#side-collapse-subtitle_lng_str_mv').parent().css('display', 'none');
		} else {
			$('#side-panel-subtitle_lng_str_mv button').click();
		}
	}, 800);
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
			height = height + heightOffset;
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

// Old /keski/
if (locationUrl.indexOf('/keski/') > -1) {
	window.location = locationUrl.replace('/keski/', '/');
}
// /Content/ should not be case sensitive...
if (locationUrl.indexOf('/content/') > -1) {
	window.location = locationUrl.replace('/content/', '/Content/');
}
// Redirect from the old "arena" -web library.
if (locationUrl.indexOf('/web/arena') > -1) {
	window.location = locationUrl.replace('/web/arena', '');
}
if (locationUrl.indexOf('?lng=fi') > -1) {
	locationUrl = locationUrl.replace('?lng=fi', '');
} else if (locationUrl.indexOf('?lng=en-gb') > -1) {
	locationUrl = locationUrl.replace('?lng=en-gb', '');
}
// Load fonts.
importJsOrCssFile('https://fonts.googleapis.com/css?family=Lato|Open+Sans&display=swap', 'css');
// Load moment
if (!window.moment) {
	console.log('Load moment.');
	importJsOrCssFile('/keski/themes/custom/js/lib/moment.min.js', 'js');
}
// Load moment tilefallback
if (!window.tileLayer) {
	console.log('Load Leaflet tile fallback.');
	importJsOrCssFile('https://keski-finna.fi/external/finna/js/lib/leafletTileFallback.min.js', 'js');
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
			importJsOrCssFile('https://keski-finna.fi/external/finna/js/eventsTest.js', 'js');
			return;
		}
		importJsOrCssFile('https://keski-finna.fi/external/finna/js/dist/news.js', 'js');
		importJsOrCssFile('https://keski-finna.fi/external/finna/js/dist/events.js', 'js');
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

// This file is used to dynamically generate styles for library & homePage pages.
// https://stackoverflow.com/questions/3922139/add-css-to-head-with-javascript
function addCssToDocument(css) {
	var head = document.getElementsByTagName('head')[0];
	var s = document.createElement('style');
	s.setAttribute('type', 'text/css');
	if (s.styleSheet) {
		// IE
		s.styleSheet.cssText = css;
	} else {
		// the world
		s.appendChild(document.createTextNode(css));
	}
	head.appendChild(s);
}

function require(url, callback) {
	var e = document.createElement('script');
	e.src = url;
	e.type = 'text/javascript';
	e.addEventListener('load', callback);
	document.getElementsByTagName('head')[0].appendChild(e);
}

function fixFooterPosition() {
	var mainHeight = $('.main').innerHeight();
	if (window.innerWidth < 769 || mainHeight > 1300) {
		$('#jsFootPositionFix').css('height', 0 + 'px');
		return;
	}
	var bodyHeight = window.innerHeight;
	var bodyHeightMinusContent = Math.round(
		mainHeight + $('footer').innerHeight() + $('header').innerHeight() - bodyHeight
	);
	if (bodyHeightMinusContent < 0) {
		bodyHeightMinusContent = Math.abs(bodyHeightMinusContent); // Convert negative value to a positive.
		bodyHeightMinusContent = bodyHeightMinusContent - 45; // -45 to account margins.
		$('#jsFootPositionFix').css('height', bodyHeightMinusContent + 'px');
	} else {
		$('#jsFootPositionFix').css('height', '0px');
	}
}

function main() {
	addSelectedNav();
	appendSearchBar();
	leftNavigationScrollDisplay();
	// Use the weird syntax for ie11 compatibility
	var externalLinks = Array.prototype.slice.call(document.querySelectorAll('a[target="_blank"]'));
	externalLinks.forEach(function (link, idx) {
		generateAccessibleExternalLink(link);
		//addNoOpener(link); Trust the links.
	});

	if ($('.keski-news-home').length === 1) {
		homeLibFunctionality();
	}

	if (locationUrl.indexOf('/Search/Results') > -1) {
		window.onload = function () {
			smartPaginationDisplay();
		};
		$('#browseLi').css('display', 'none');
	}

	if (locationUrl.indexOf('/Record/keski') > -1) {
		window.onload = function () {
			// Hide or show qr code link $('.finnaQrcodeLinkRecord').parent().css('display', 'none');
			addClassesToAvailableOnWebFilter();
			$('.export-toggle').parent().css('display', 'none');
		};
	}
	/* TODO: Use dropdown styles from search in advanced search
    else if(locationUrl.indexOf(('Search/Advanced'))) {
        //console.log("do smart")
        //$('.limit').prepend('<span class="results-on-page">' + 'Näytä' + ':</span>');
    } */
	//$('.autocomplete-results').addClass('hidden-search-autocomplete');

	// Hacky sticky footer fix since Finna does not like the modern ways..
	$('.main').append('<div class="sr-hidden" aria-hidden="true" id="jsFootPositionFix" style="height: 0;">&nbsp;</div>');
	fixFooterPosition();
	// Add event listener for resizing the window, adjust parent when done so.
	// https://stackoverflow.com/questions/5489946/jquery-how-to-wait-for-the-end-of-resize-event-and-only-then-perform-an-ac
	var rtime;
	var timeout = false;
	var delta = 200;
	$(window).resize(function () {
		rtime = new Date();
		if (timeout === false) {
			timeout = true;
			setTimeout(resizeend, delta);
		}
	});
	function resizeend() {
		if (new Date() - rtime < delta) {
			setTimeout(resizeend, delta);
		} else {
			timeout = false;
			// Occasionally the first time wont work, thus repeat.
			fixFooterPosition();
			setTimeout(function () {
				fixFooterPosition();
			}, 100);
		}
	}
}

main();
