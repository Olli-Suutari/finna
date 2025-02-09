var isFrontPage = $('.keski-news-home').length === 1;
var isNewsPage = $('.news-page').length === 1;
var newsList = [];
var isEnglish = false;
if (document.documentElement.lang.toLowerCase() !== 'fi') {
	isEnglish = true;
}
var newsCacheStamp = localStorage.getItem('keskiNewsTimestamp');
// Function for comparing newsCacheStamp to the latest available version / setting the timestamp after fetching events.
function checkNewsCache() {
	$.getJSON('https://keski-finna.fi/wp-json/acf/v3/cache', function (data) {
		var newNewsStampValue = data[0].acf.news_stamp;
		newsCacheStamp = localStorage.getItem('keskiNewsTimestamp');
		if (newsCacheStamp === newNewsStampValue) {
			var cachedNews = localStorage.getItem('keskiNews');
			if (cachedNews !== null) {
				// Use cached news
				cachedNews = JSON.parse(cachedNews);
				$(cachedNews).each(function () {
					var item = $(this)[0].acf;
					addNewsToArray(item);
				});
				afterNewsListIsGenerated();
			} else {
				// If the news are missing for whatever reason.
				localStorage.setItem('keskiNewsTimestamp', newNewsStampValue);
				fetchNews();
			}
		} else {
			localStorage.setItem('keskiNewsTimestamp', newNewsStampValue);
			fetchNews();
		}
	});
}

// Remove httml & www from url and / # from the end.
function generatePrettyUrl(url) {
	url = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '');
	// Remove / and # from url if last characters
	if (url.substring(url.length - 1) === '/' || url.substring(url.length - 1) === '#') {
		url = url.substring(0, url.length - 1);
	}
	return url;
}

function addFrontPageItems(array) {
	for (var i = 0; i < 4; i++) {
		var itemDate = array[i].prettyDate;
		var itemImg = '';
		if (array[i].image !== null) {
			itemImg = '<img class="news-image" alt="" src="' + array[i].image + '">';
		}
		var itemLink = '';
		if (array[i].link !== null) {
			var prettyUrl = generatePrettyUrl(array[i].link);
			itemLink =
				'<p class="news-link"><i class="fa fa-globe" aria-hidden="true"></i>' +
				'<a  href="' +
				array[i].link +
				'">' +
				prettyUrl +
				'</a></p>';
		}
		var itemTitle = array[i].title;
		if (isEnglish && array[i].titleEn !== null) {
			itemTitle = array[i].titleEn;
		}
		var itemContent = array[i].content;
		if (isEnglish && array[i].contentEn !== null) {
			itemContent = array[i].contentEn;
		}

		itemContent = '<div class="news-content">' + itemContent + itemLink + itemImg + '</div>';
		// Use default image if image is missing.
		if (array[i].image == null) {
			array[i].image = 'https://keski-finna.fi/wp-content/uploads/paakirjasto59_YouTube_820x461_acf_cropped.jpg';
		}
		var listItem =
			"<li class='news-item news-li front-page-news-li'><div class='news-container front-page-news-container'>" +
			"<a href='/Content/uutiset?news=" +
			newsList[i].url +
			"' class='news-item-link' title='" +
			i18n.get('Read') +
			': ' +
			itemTitle +
			"'  data-url='" +
			newsList[i].url +
			"' " +
			"data-name='" +
			itemTitle +
			"' data-message='" +
			itemContent +
			"'>" +
			"<img class='news-li-image front-page-news-image' alt='' src='" +
			array[i].image +
			"'> " +
			"<div class='news-text-container front-page-news-text-container'><span class='news-li-title front-page-news-li-title'>" +
			itemTitle +
			"</span><span class='news-li-date front-page-news-date'>" +
			itemDate +
			'</span>' +
			'</div></a></div></li>';
		$('#keskiNewsUl').append(listItem);
	}
	$('#keskiNews .loader').css('display', 'none');
}
// Items on the separate news page.
function addNewsPageItems(array) {
	for (var i = 0; i < array.length; i++) {
		var itemDate = array[i].prettyDate;
		var itemImg = '';
		if (array[i].image !== null) {
			itemImg = '<img class="news-image" alt="" src="' + array[i].image + '">';
		}
		var itemLink = '';
		if (array[i].link !== null) {
			var prettyUrl = generatePrettyUrl(array[i].link);
			itemLink =
				'<p class="news-link"><i class="fa fa-globe" aria-hidden="true"></i>' +
				'<a  href="' +
				array[i].link +
				'">' +
				prettyUrl +
				'</a></p>';
		}
		var itemTitle = array[i].title;
		if (isEnglish && array[i].titleEn !== null) {
			itemTitle = array[i].titleEn;
		}
		var itemContent = array[i].content;
		if (isEnglish && array[i].contentEn !== null) {
			itemContent = array[i].contentEn;
		}

		itemContent = '<div class="news-content">' + itemContent + itemLink + itemImg + '</div>';

		// Use default image if image is missing.
		if (array[i].image == null) {
			array[i].image = 'https://keski-finna.fi/wp-content/uploads/paakirjasto59_YouTube_820x461_acf_cropped.jpg';
		}

		var listItem =
			"<li class='news-item news-li news-page-news-li'><div class='news-container news-page-news-container'>" +
			"<a href='/Content/uutiset?news=" +
			newsList[i].url +
			"' class='news-item-link'  title='" +
			i18n.get('Read') +
			': ' +
			itemTitle +
			"' data-url='" +
			newsList[i].url +
			"' " +
			"data-name='" +
			itemTitle +
			"' data-message='" +
			itemContent +
			"'>" +
			"<img class='news-li-image news-page-news-image' alt='' src='" +
			array[i].image +
			"'> " +
			"<div class='news-text-container news-page-news-text-container'><span class='news-li-title news-page-news-li-title'>" +
			itemTitle +
			"</span><span class='news-li-date news-page-news-date'>" +
			itemDate +
			'</span>' +
			'</div></a></div></li>';
		$('#keskiNewsUl').append(listItem);
	}
	$('#keskiNews .loader').css('display', 'none');
}

function addNewsToArray(item) {
	// Always set finnish as a fallback.
	var itemTitleFi = '';
	var itemTitleEn = null;
	var itemContentFi = '';
	var itemContentEn = null;
	var itemPublishDate = '';
	var prettyDate = '';
	var itemLink = null;
	var itemImg = null;
	var itemUrl = '';

	itemUrl = item.perma_link;
	// Dates
	var rawDate = item.publish_date;
	var year = rawDate.substr(6, 4);
	var month = rawDate.substr(3, 2);
	var day = rawDate.substr(0, 2);
	prettyDate = day + '.' + month + '.';
	if (isNewsPage) {
		prettyDate = prettyDate + year;
	}
	itemPublishDate = new Date();
	itemPublishDate.setDate(day);
	itemPublishDate.setMonth(month - 1);
	itemPublishDate.setYear(year);
	itemPublishDate.setHours(0);
	itemPublishDate.setMinutes(1);
	// If item is not to be published yet, return.
	var now = new Date();
	if (itemPublishDate > now) {
		return;
	}
	// Continue the data processing and push to array in the end.
	if (item.link_url != '') {
		itemLink = item.link_url;
	}
	if (item.image != false) {
		itemImg = item.image;
	}
	// Title
	itemTitleFi = item.title;
	if (item.english_title != '' && isEnglish) {
		itemTitleEn = item.english_title;
	}
	// Description
	itemContentFi = item.content;
	if (item.english_content != '' && isEnglish) {
		itemContentEn = item.english_content;
	}
	// Push to newsList.
	newsList.push({
		url: itemUrl,
		date: itemPublishDate,
		prettyDate: prettyDate,
		title: itemTitleFi,
		content: itemContentFi,
		titleEn: itemTitleEn,
		contentEn: itemContentEn,
		image: itemImg,
		link: itemLink
	});
}

function afterNewsListIsGenerated() {
	// Sort, generate list and bind modal functionality.
	newsList.sort(function (a, b) {
		var dateA = new Date(a.date),
			dateB = new Date(b.date);
		return dateB - dateA;
	});
	if (isFrontPage) {
		addFrontPageItems(newsList);
	} else {
		addNewsPageItems(newsList);
	}
	bindNewsModalFunctionality();
}

function fetchNews() {
	$.ajax('https://keski-finna.fi/wp-json/acf/v3/news?per_page=500', {
		accepts: {
			xml: 'application/json'
		},
		dataType: 'json',
		success: function (data) {
			localStorage.setItem('keskiNews', JSON.stringify(data));
			$(data).each(function () {
				var item = $(this)[0].acf;
				addNewsToArray(item);
			});
		},
		error: function (request, status, error) {
			console.log(error);
		},
		complete: function () {
			afterNewsListIsGenerated();
		}
	});
}

function bindNewsModalFunctionality() {
	// Open the news if url contains a news link.
	var pageUrl = window.location.href;
	pageUrl = decodeVal(pageUrl);
	if (pageUrl.indexOf('?news=') > -1) {
		// If we use simple indexOf match articles that contain other articles names are problematic,
		// eg. news=test and news=test-2
		var reMatchNews = new RegExp(/\?news=.*/g);
		var matchingNewsInUrl = pageUrl.match(reMatchNews)[0];
		for (var i = 0; i < newsList.length; i++) {
			var toMatch = '?news=' + newsList[i].url;
			if (matchingNewsInUrl === toMatch) {
				var toClick = newsList[i].url;
				setTimeout(function () {
					$('.news-item')
						.find('[data-url="' + toClick + '"]')
						.click();
				}, 400);
			}
		}
	}

	$('.news-item-link').on('click', function (e) {
		e.preventDefault();
		var popupTitle = $(this).data('name');
		var popupText = $(this).data('message');
		// Remove multiple spaces
		popupText = popupText.replace(/^(&nbsp;)+/g, '');
		// This would remove br from <br>*:  popupText = popupText.replace(/(<|&lt;)br\s*\/*(>|&gt;)/g, ' ');
		// Remove empty paragraphs
		popupText = popupText.replace(/(<p>&nbsp;<\/p>)+/g, '');
		popupText = popupText.replace(/(<p><\/p>)+/g, '');
		popupText = popupText.replace(/(<p>\s<\/p>)+/g, '');
		// Replace the modal content.
		$('#newsModalTitle').replaceWith('<h1 class="modal-title" id="newsModalTitle">' + popupTitle + '</h1>');
		$('#newsModalBody').replaceWith(
			'<div id="newsModalBody" class="modal-body">' +
				'<div> ' +
				'<div class="feed-content">' +
				'<div class="holder">' +
				popupText +
				'</div>' +
				'</div>' +
				'</div' +
				'></div>'
		);

		// Show modal.
		$('#newsModal').modal('show');

		// Update the page url.
		var itemUrl = $(this).data('url').toString();

		var currentUrl = window.location.href.toString();

		// Do not add to url if already there.
		if (currentUrl.indexOf(itemUrl) === -1) {
			itemUrl = currentUrl + '?news=' + itemUrl;
			var stateObj = { urlValue: itemUrl };
			history.replaceState(stateObj, popupTitle, itemUrl);
		}
	});

	$('#newsModal').on('hide.bs.modal', function () {
		var pageUrl = window.location.href;
		if (pageUrl.indexOf('?news=')) {
			var reMatchNews = new RegExp(/\?news=.*/g);
			pageUrl = pageUrl.replace(reMatchNews, '');
			var stateObj = { urlValue: pageUrl };
			history.replaceState(stateObj, '', pageUrl);
		}
	});
}

if (isFrontPage || isNewsPage) {
	checkNewsCache();
}
