// Fetch news from the keski-finna.fi content portal.
var feed = "https://keski-finna.fi/?feed=rss2";

var newsList = [];

var isEnglish = false;
if (document.documentElement.lang.toLowerCase() !== "fi" ) {
    isEnglish = true;
}

// Remove httml & www from url and / # from the end.
function generatePrettyUrl (url) {
    url = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
    // Remove / and # from url if last characters
    if (url.substring(url.length-1) === "/" || url.substring(url.length-1) === "#") {
        url = url.substring(0, url.length-1);
    }
    return url;
}

function serializeRssValue(element) {
    if (navigator.userAgent.indexOf('MSIE ') > -1 || navigator.userAgent.indexOf('Trident/') > -1) {
        var itemValue = new XMLSerializer().serializeToString(element);
        // Remove empty image tags.
        itemValue = itemValue.replace('<news:image xmlns:news="https://keski-finna.fi" />', '');
        var matchTagStart = new RegExp(/.+.fi">/g);
        var matchTagEnd = new RegExp(/<\/news.+/g);
        itemValue = itemValue.replace(matchTagStart, '');
        itemValue = itemValue.replace(matchTagEnd, '');
        // Remove title tag from the title.
        itemValue = itemValue.replace('<title>', '');
        itemValue = itemValue.replace('</title>', '');
        return itemValue;
    }
    else {
        return element.innerHTML;
    }
}

$.ajax(feed, {
    accepts:{
        xml:"application/rss+xml"
    },
    dataType:"xml",
    success:function(data) {
        // Credit: http://stackoverflow.com/questions/10943544/how-to-parse-an-rss-feed-using-javascript
        var now = new Date();

        $(data).find("item").each(function () { // or "item" or whatever suits your feed
            var el = $(this);
            // IE does not support .children, use childNodes
            var itemData = el[0].childNodes;
            // Always set finnish as a fallback.
            var itemTitleFi = "";
            var itemTitleEn = null;
            var itemContentFi = "";
            var itemContentEn = null;
            var itemPublishDate = "";
            var prettyDate = "";
            var itemLink = null;
            var itemImg = null;
            var itemUrl = "";

            for (var i = 0; i < itemData.length; i++) {

                if (itemData[i].localName === "perma_link") {
                    itemUrl = serializeRssValue(itemData[i]);
                }
                if (itemData[i].localName === "publish_date") {

                    var rawDate = serializeRssValue(itemData[i]);
                    var year = rawDate.substr(0, 4);
                    var month = rawDate.substr(4, 2);
                    var day = rawDate.substr(6, 2);
                    prettyDate = day + "." + month + ".";
                    itemPublishDate = new Date();
                    itemPublishDate.setDate(day);
                    itemPublishDate.setMonth(month -1);
                    itemPublishDate.setYear(year);
                    itemPublishDate.setHours(0);
                    itemPublishDate.setMinutes(1);

                }
                if (itemData[i].localName === "link_url") {
                    itemLink = serializeRssValue(itemData[i]);
                }
                if (itemData[i].localName === "image") {
                    itemImg = serializeRssValue(itemData[i]);
                }
                // Title
                if (itemData[i].localName === "title") {
                    itemTitleFi = serializeRssValue(itemData[i]);
                }
                if (itemData[i].localName === "english_title" && isEnglish) {
                    itemTitleEn = serializeRssValue(itemData[i]);
                }
                // Description
                if (itemData[i].localName === "content") {
                    itemContentFi = serializeRssValue(itemData[i]);
                }
                if (itemData[i].localName === "english_content" && isEnglish) {
                    itemContentEn = serializeRssValue(itemData[i]);
                }
            }
            if (itemPublishDate < now) {
                newsList.push( { url: itemUrl, date:  itemPublishDate, prettyDate: prettyDate, title: itemTitleFi,
                    content: itemContentFi, titleEn: itemTitleEn, contentEn: itemContentEn, image: itemImg, link: itemLink } );
            }
        });

    },
    error: function (request, status, error) {
        console.log(error)
    },
    complete: function () {
        newsList.sort(function(a, b) {
            var dateA = new Date(a.date), dateB = new Date(b.date);
            return dateB - dateA;
        });

        for (var i = 0; i < newsList.length; i++) {
            var itemDate = newsList[i].prettyDate;
            var itemImg = "";
            if (newsList[i].image !== null) {
                itemImg = '<img class="news-image" alt="" src="' + newsList[i].image + '">'
            }
            var itemLink = "";
            if (newsList[i].link !== null) {
                var prettyUrl = generatePrettyUrl(newsList[i].link);
                itemLink = '<p class="news-link"><i class="fa fa-globe" aria-hidden="true"></i>' +
                    '<a  href="' + newsList[i].link + '">' + prettyUrl + '</a></p>';
            }
            var itemTitle = newsList[i].title;
            if (isEnglish && newsList[i].titleEn !== null) {
                itemTitle = newsList[i].titleEn;
            }
            var itemContent = newsList[i].content;
            if (isEnglish && newsList[i].contentEn !== null) {
                itemContent = newsList[i].contentEn;
            }


            itemContent = '<div class="news-content">' + itemContent + itemLink +  itemImg + '</div>';

            var listItem = "<li class='news-item'>" +
                "<a href='javascript:void(0);' class='news-item-link' data-url='" + newsList[i].url + "' " +
                "data-name='" + itemTitle + "' data-message='" + itemContent + "'>" +
                "<span class='news-date'>" + itemDate + "</span> " + itemTitle + "</a></li>";

            $('#keskiNewsUl').append(listItem);
        }


        // Open the news if url contains a news link.
        var pageUrl = window.location.href;
        if (pageUrl.indexOf('?news=') > -1) {
            // If we use simple indexOf match articles that contain other articles names are problematic,
            // eg. news=test and news=test-2
            var reMatchNews = new RegExp(/\?news=.*/g);
            var matchingNewsInUrl = pageUrl.match(reMatchNews)[0];
            for (var i = 0; i < newsList.length; i++) {
                var toMatch = "?news=" + newsList[i].url;
                if(matchingNewsInUrl === toMatch) {
                    var toClick = newsList[i].url;
                    setTimeout(function(){
                        $(".news-item").find('[data-url="'+ toClick +'"]').click();
                    }, 400);
                }
            }
        }

        $(".news-item-link").on('click', function (e) {
            var popupTitle = $(this).data('name');
            var popupText = $(this).data('message');
            // Remove multiple spaces
            popupText = popupText.replace(/^(&nbsp;)+/g, '');
            // This would remove br from <br>*:  popupText = popupText.replace(/(<|&lt;)br\s*\/*(>|&gt;)/g, ' ');
            // Remove empty paragraphs
            popupText = popupText.replace(/(<p>&nbsp;<\/p>)+/g, "");
            popupText = popupText.replace(/(<p><\/p>)+/g, "");
            popupText = popupText.replace(/(<p>\s<\/p>)+/g, "");
            // Check if large or small text/modal.

            //$(".feed-content .holder").replaceWith('<div class="holder">' + popupText + '</div>');


            //$(".modal-body").replaceWith('<div class="modal-body"><h1>Otsikko</h1><div class="feed-content">' +
            //    '<div class="holder">' + popupText + '</div> </div></div>');

            $('.modal-dialog').addClass('modal-lg');

            $(".modal-body").replaceWith(
                '<div class="modal-body">' +
                        '<h1 class="news-title">' + popupTitle + '</h1>' +
                        '<div> ' +
                        '<div class="feed-content">' +
                        '<div class="holder">' + popupText + '</div>' +
                '</div>' +
                '</div' +
                '></div>');


            // Show modal.
            //console.log("e.pageY " + e.pageY + " | ta "  +offSet);
            $('#modal').modal('show');

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

        $("#modal").on('hide.bs.modal', function(){
            var pageUrl = window.location.href;
            if (pageUrl.indexOf('?news=')) {
                var reMatchNews = new RegExp(/\?news=.*/g);
                pageUrl = pageUrl.replace(reMatchNews, '');
                var stateObj = { urlValue: pageUrl };
                history.replaceState(stateObj, '', pageUrl);

            }
        });

}

});


