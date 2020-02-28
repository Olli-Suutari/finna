// Fetch news from the keski-finna.fi content portal.
var feed = "https://keski-finna.fi/?feed=rss2";

var newsList = [];

var isEnglish = false;
if (document.documentElement.lang.toLowerCase() !== "fi" ) {
    isEnglish = true;
}
console.log(isEnglish);

$.ajax(feed, {
    accepts:{
        xml:"application/rss+xml"
    },
    dataType:"xml",
    success:function(data) {
        //Credit: http://stackoverflow.com/questions/10943544/how-to-parse-an-rss-feed-using-javascript

        $(data).find("item").each(function () { // or "item" or whatever suits your feed

            var el = $(this);
            console.log(el[0]);

            var itemData = el[0].children;


            // Always set finnish as a fallback.
            var itemTitleFi = "";
            var itemTitleEn = null;
            var itemContentFi = "";
            var itemContentEn = null;
            var itemPublishDate = "";
            var prettyDate = "";
            var itemLink = null;
            var itemImg = null;


            for (var i = 0; i < itemData.length; i++) {

                if (itemData[i].localName === "publish_date") {
                    var rawDate  = itemData[i].innerHTML;
                    var year = rawDate.substr(0, 4);
                    var month = rawDate.substr(4, 2);
                    var day = rawDate.substr(6, 2);
                    prettyDate = day + "." + month + ".";
                    itemPublishDate = new Date();
                    itemPublishDate.setDate(day);
                    itemPublishDate.setMonth(month);
                    itemPublishDate.setYear(year);
                }
                if (itemData[i].localName === "link_url") {
                    itemLink = itemData[i].innerHTML;
                }
                if (itemData[i].localName === "image") {
                    itemImg = itemData[i].innerHTML;
                }
                // Title
                if (itemData[i].localName === "title") {
                    itemTitleFi = itemData[i].innerHTML;
                }
                if (itemData[i].localName === "english_title" && isEnglish) {
                    itemTitleEn = itemData[i].innerHTML;
                }
                // Description
                if (itemData[i].localName === "content") {
                    itemContentFi = itemData[i].innerHTML;
                }
                if (itemData[i].localName === "english_content" && isEnglish) {
                    itemContentEn = itemData[i].innerHTML;
                }
                //Do something
            }

            newsList.push( { date:  itemPublishDate, prettyDate: prettyDate, title: itemTitleFi, content: itemContentFi,
                titleEn: itemTitleEn, contentEn: itemContentEn, image: itemImg, link: itemLink } );

        });

    },
    complete: function () {
        newsList.sort(function(a, b) {
            var dateA = new Date(a.date), dateB = new Date(b.date);
            return dateA - dateB;
        });

        for (var i = 0; i < newsList.length; i++) {
            var itemDate = newsList[i].prettyDate;
            var itemImg = "";
            if (newsList[i].image !== null) {
                itemImg = '<img class="news-image" alt="" src="' + newsList[i].image + '">'
            }
            var itemLink= newsList[i].link;
            var itemTitle = newsList[i].title;
            if (isEnglish && newsList[i].titleEn !== null) {
                itemTitle = newsList[i].titleEn;
            }
            var itemContent = newsList[i].content;
            if (isEnglish && newsList[i].contentEn !== null) {
                itemContent = newsList[i].contentEn;
            }


            itemContent = itemImg + itemContent;

            var listItem = "<li class='news-item'>" +
                "<a href='javascript:void(0);' class='news-item-link' data-name='" + itemTitle + "' data-message='" + itemContent + "'>" +
                "<span class='news-date'>" + itemDate + "</span> " + itemTitle + "</a></li>";



            $('#keskiNewsUl').append(listItem);
        }

        console.log(newsList);



        $(".news-item-link").on('click', function (e) {
            var popupTitle = $(this).data('name');
            var popupText = $(this).data('message');
            // Remove multiple spaces
            console.log(popupText);
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

            $(".modal-body").replaceWith(
                '<div class="modal-body">' +
                        '<h2>' + popupTitle + '</h2>' +
                        '<div> ' +
                        '<div class=" feed-content">' +
                        '<div class="date" style="display: inline-block;">Julkaistu: <span>25.2.2020</span></div>' +
                        '<div class="holder">' + popupText + '</div>' +
                '</div>' +
                '</div' +
                '></div>');


            // Show modal.
            //console.log("e.pageY " + e.pageY + " | ta "  +offSet);
            $('#modal').modal('show');
        });










}

});


