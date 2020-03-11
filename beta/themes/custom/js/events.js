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

function generateEventList(events) {
    for (var i = 0; i < events.length; i++) {
        var event = events[i].acf;
        console.log(event);
        // Always set finnish as a fallback.
        var itemTitleFi = "";
        var itemTitleEn = null;
        var itemContentFi = "";
        var itemContentEn = null;
        var itemStartDate = "";
        var prettyDate = "";
        var itemLink = null;
        var itemImg = null;
        var itemUrl = "";
        var organizers = [];
        var customAddress = null;
        var tags = [];
        var price = 0;
    }
}

if (isEventsPage) {
    fetchEvents();
}

