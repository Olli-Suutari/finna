var isEventsPage = $('.events-page').length === 1;

function  fetchEvents() {

    $.ajax("https://keski-finna.fi/wp-json/acf/v3/events", {
        accepts:{
            xml:"application/json"
        },
        dataType:"json",
        success:function(data) {
            console.log(data);
            generateEventList(data);
        },
        error: function (request, status, error) {
            console.log(error)
        },
        complete: function () {

        }
    });
}

function generateEventItem(event) {
    console.log(event);
    // Always set finnish as a fallback.

    var itemStartDate = "";
    var prettyDate = "";
    var organizers = [];
    var customAddress = null;
    var tags = [];
    var price = 0;

    //var startDate = moment(event.start_date).format('Y-m-d H:i')
    //var startDate = new Date(moment(event.start_date, "YYYY-MM-DD HH:mm"));
    var standardStartDate = new Date(moment(event.start_date, "DD.MM.YYYY HH.mm"));

    // 10 first chars = date.
    var startDateDay = event.start_date.substr(0, 10);
    // 5 last chars = time.
    var startDateTime = event.start_date.slice(-5);
    // If 00.00 = no specified start time.
    if (startDateTime === "00.00") {
        startDateTime = "";
    }

    var startTimeDisplay = '';
    if (startDateTime !== "") {
        startTimeDisplay = '<i class="fa fa-clock-o" aria-hidden="true"></i>' + startDateTime
    }




    var endDateDay = "";
    var endDateTime = "";

    if (event.end_date !== null && event.end_date !== "") {
        endDateDay = event.end_date.substr(0, 10);
        endDateTime = event.end_date.slice(-5);
        // If 00.00 = no specified start time.
        if (endDateTime === "00.00") {
            endDateTime = "";
        }
    }


    var endDateTimeDisplay = "";


    if (endDateDay !== "") {
        // If ending date is same as starting date.
        console.log("endDateDay == startDateDay " + endDateDay + " " +  startDateDay);
        if (endDateDay == startDateDay) {
            console.log("IS SAME")
            startTimeDisplay = startTimeDisplay + " – "  + endDateTime
        }
        else {
            var endTimeDisplay = "";
            if (endDateTime !== "") {
                endTimeDisplay = '<i class="fa fa-clock-o" aria-hidden="true"></i>' + endDateTime
            }
            endDateTimeDisplay = '– <span class="event-end-time"> ' +  endDateDay +
                endTimeDisplay + '</span>';
        }
    }


    console.log(endDateDay);



    var dateDisplayRow = '<span class="event-li-time">' +
        '<i class="fa fa-calendar" aria-hidden="true"></i>' +
        startDateDay + '</span>' + startTimeDisplay + endDateTimeDisplay;

    console.log(dateDisplayRow);

    var itemImg = "";
    if (event.image !== null) {
        itemImg = '<img class="news-image" alt="" src="' + event.image + '">'
    }
    var itemLink = "";
    if (event.link_url !== null) {
        var prettyUrl = generatePrettyUrl(event.link_url);
        itemLink = '<p class="news-link"><i class="fa fa-globe" aria-hidden="true"></i>' +
            '<a  href="' + event.link + '">' + prettyUrl + '</a></p>';
    }
    var itemTitle = event.title;
    if (isEnglish && event.english_title !== null) {
        itemTitle = event.english_title;
    }
    var itemContent = event.content;
    if (isEnglish && event.english_content !== null) {
        itemContent = event.english_content;
    }

    itemContent = '<div class="news-content">' + itemContent + itemLink +  itemImg + '</div>';

    var listItem = "<li class='events-item'>" +
        "<a href='javascript:void(0);' class='events-item-link' data-url='" + event.perma_link + "' " +
        "data-name='" + itemTitle + "' data-message='" + itemContent + "'>" +
        "<span class='news-date'>" + 'AIKA: ' + "</span><span class='news-li-title'>" + itemTitle + "</span></a></li>";

    $('#keskiEventsUl').append(listItem);

}

function generateEventList(events) {
    for (var i = 0; i < events.length; i++) {
        generateEventItem(events[i].acf);
    }

    $('#keskiEventsUl').append('<li class="event-li">' +
        '<a class="event-li-container" href="javascript:void(0);">' +
        '<span class="event-li-title"><i class="fa fa-pencil-square" aria-hidden="true"></i>Kaunialassa kajahtaa</span>' +
        '<span class="event-li-time"><i class="fa fa-calendar" aria-hidden="true"></i>10.3.2020<i class="fa fa-clock-o" aria-hidden="true"></i> 15.00 – 19.00</span>' +
        '<span class="event-li-place"><i class="fa fa-map-marker" aria-hidden="true"></i>Kaunialan kunnankirjasto</span>' +
        //'<span class="event-li-tags"><i class="fa fa-bullseye" aria-hidden="true"></i> Esitys</span>' +
        '</a>' +
    '</li>');

    // Open the news if url contains a news link.
    var pageUrl = window.location.href;
    if (pageUrl.indexOf('?event=') > -1) {
        // If we use simple indexOf match articles that contain other articles names are problematic,
        // eg. news=test and news=test-2
        var reMatchNews = new RegExp(/\?event=.*/g);
        var matchingNewsInUrl = pageUrl.match(reMatchNews)[0];
        for (var i = 0; i < newsList.length; i++) {
            var toMatch = "?event=" + newsList[i].url;
            if(matchingNewsInUrl === toMatch) {
                var toClick = newsList[i].url;
                setTimeout(function(){
                    $(".events-item").find('[data-url="'+ toClick +'"]').click();
                }, 400);
            }
        }
    }

    $(".events-item-link").on('click', function (e) {
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
            itemUrl = currentUrl + '?event=' + itemUrl;
            var stateObj = { urlValue: itemUrl };
            history.replaceState(stateObj, popupTitle, itemUrl);
        }

    });

    $("#modal").on('hide.bs.modal', function(){
        var pageUrl = window.location.href;
        if (pageUrl.indexOf('?event=')) {
            var reMatchNews = new RegExp(/\?event=.*/g);
            pageUrl = pageUrl.replace(reMatchNews, '');
            var stateObj = { urlValue: pageUrl };
            history.replaceState(stateObj, '', pageUrl);

        }
    });




}

if (isEventsPage) {
    fetchEvents();
}

