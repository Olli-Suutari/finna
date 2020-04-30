var isEventsPage = false;
var isEnglish = false;

var eventTags = [];
var eventLocations = [];
var allEvents = [];
var filteredEvents = [];
var eventMap;


var lang = "fi";

var i18n;


var libraryList = [];

var faPath = "https://keski-finna.fi/external/finna/style/fa/svgs/solid/";


function fetchConsortiumLibraries(consortium) {
    var consortiumLibListDeferred = jQuery.Deferred();
    setTimeout(function() {

        $.getJSON("https://api.kirjastot.fi/v4/library?lang=" + lang + "&consortium=" + consortium +
            "&limit=1500", function(data) {
            for (var i=0; i<data.items.length; i++) {
                // Include mobile libraries in consortium listings...
                libraryList.push({
                    id: data.items[i].id, text: data.items[i].name,
                    city: data.items[i].city.toString(),
                    street: data.items[i].address.street,
                    zipcode: data.items[i].address.zipcode,
                    coordinates: data.items[i].coordinates,
                    services: JSON.stringify(data.items[i].services)
                });
                // Wiitaunion mobile library is used in both "Pihtipudas (85449)" and "Viitasaari".
                if(data.items[i].id == 85449) {
                    libraryList.push({
                        id: data.items[i].id, text: data.items[i].name,
                        city: "16055",
                        street: data.items[i].address.street,
                        zipcode: data.items[i].address.zipcode,
                        coordinates: data.items[i].coordinates,
                        services: JSON.stringify(data.items[i].services)
                    });
                }
            }

            consortiumLibListDeferred.resolve();

        });

    }, 1 );
    // Return the Promise so caller can't change the Deferred
    return consortiumLibListDeferred.promise();

}

// Adds tags to eventTags array if they do not already exists. Increases type count if already exists.
function addTagToTagArray(tag) {
    tag = JSON.parse(tag);
    var tagAlreadyExists = false;
    for (var t = 0; t < eventTags.length; t++) {
        if (eventTags[t].id == tag.id) {
            eventTags[t].count = eventTags[t].count +1;
            tagAlreadyExists = true;
        }
    }
    if (!tagAlreadyExists) {
        eventTags.push( { id: tag.id, nameFi: tag.fi, nameEn: tag.en, count: 1 });
    }
}
// Adds location to eventLocations array if they do not already exists. Increases count if already exists.
function addLocationsToLocationArray(location) {
    var locationAlreadyExists = false;
    for (var t = 0; t < eventLocations.length; t++) {
        if (eventLocations[t].id ==  location) {
            eventLocations[t].count = eventLocations[t].count +1;
            locationAlreadyExists = true;
        }
    }
    if (!locationAlreadyExists) {
        eventLocations.push( { id: location, count: 1 });
    }
}


var checkedTags = [];
var checkedLocations = [];

function locationExists(location) {
    return filteredEvents.some(function(el) {
        return el.city == location;
    });
}

function tagExists(tag) {
    return filteredEvents.some(function(el) {
        return el.tags == tag;
    });
}

function filterEvents(triggeredByTagFilter) {
    filteredEvents = [];
    var filteredByTags = [];
    var filteredByLocations = [];
    var allEventsCopy = allEvents;
    // Match all events against selected filters.
    for (var i = 0; i < allEvents.length; i++) {
        var foundTag = true;
        var foundLocation = true;
        if (checkedTags.length !== 0) {
            foundTag = checkedTags.some(r=> allEvents[i].tags.includes(r));
        }
        if (checkedLocations.length !== 0) {
            foundLocation = checkedLocations.some(r=> allEvents[i].city.includes(r));
        }
        // If filter matches both, the tag and the city, add it to the filteredEvents array.
        if (foundTag && foundLocation) {
            filteredEvents.push(allEvents[i]);
            $('#event-' + allEvents[i].id).removeClass('hidden-event');
        }
        else {
            $('#event-' + allEvents[i].id).addClass('hidden-event');
        }
    }

    if (filteredEvents.length === 0) {
        $('.no-matching-events').css('display', 'block');
    }
    else {
        $('.no-matching-events').css('display', 'none');
    }

    if (triggeredByTagFilter) {
        $.each($('.location-checkbox-container'), function(){
            var locationFilterId = $(this)[0].id;
            var cleanLocationId = locationFilterId.replace("location_", "");
            //filteredEvents.push(allEvents[i]);
            var filterdEventsIncludesCity = locationExists(cleanLocationId);

            if (!filterdEventsIncludesCity) {
                //console.log("HIDE: " + cleanLocationId);
                //$(this).addClass('hidden-filter')
            }
            else {
                //$(this).removeClass('hidden-filter')
            }
        });
    }
    else {
        $.each($('.tag-checkbox-container'), function(){
            var tagFilterId = $(this)[0].id;
            var cleanTagId = tagFilterId.replace("tag_", "");
            //filteredEvents.push(allEvents[i]);
            var filterdEventsIncludesTag = tagExists(cleanTagId);


            if (!filterdEventsIncludesTag) {
                //$(this).addClass('hidden-filter')
            }
            else {
                $(this).removeClass('hidden-filter')
            }
        });
    }

}

function bindFilterEvents() {
    // When tag checkbox is changed, empty the checkedTags array and trigger the filtering with the new selected items.
    $('input[name="tags"]').change(function () {
        checkedTags = [];
        $.each($("input[name='tags']:checked"), function(){
            checkedTags.push($(this).val());
        });
        filterEvents(true);
    });
    // Event location.
    $('input[name="location"]').change(function () {
        checkedLocations = [];
        $.each($("input[name='location']:checked"), function(){
            checkedLocations.push($(this).val());
        });
        filterEvents();
    });
    if (window.innerWidth > 800) {
        $('#toggleEventFilters').click();
    }
    else {
    }

}

function  fetchEvents() {

    $.ajax("https://keski-finna.fi/wp-json/acf/v3/events?per_page=500", {
        accepts:{
            xml:"application/json"
        },
        dataType:"json",
        success:function(data) {
            generateEventList(data);
        },
        error: function (request, status, error) {
            console.log(error)
        },
        complete: function () {

        }
    });
}

function generateEventItem(event, id) {
    // Always set finnish as a fallback.

    var itemStartDate = "";
    var prettyDate = "";
    var organizers = [];
    var customAddress = null;
    var tags = [];
    var tagIdList = [];
    var eventPrice = "";
    var eventLocation = "";
    var eventCityList = [];


    if (event.tags.length !== 0) {
        tags = event.tags;
        // Find ID from : { "id": 4, "fi": "Lapset", "en": "Children" }.
        for (var t = 0; t < tags.length; t++) {
            var regexMatchTagId = /("id": )(\d)/g; // Note: Regex needs to be regenerated for each loop.
            //var execMatchTagId = tags[t].match(regexMatchTagId);
            var execMatchTagId = regexMatchTagId.exec(tags[t]);
            // Add tagID to list.
            tagIdList.push(execMatchTagId[2]);
            addTagToTagArray(tags[t]);
        }
    }



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
        startTimeDisplay = '<i class="fa fa-clock-o" aria-hidden="true"></i>' + startDateTime;
        startTimeDisplay = '<img alt="" src="' + faPath + 'calendar.svg" class="fa-svg event-li-icon">' + startDateDay +
            '<img alt="" src="' + faPath + 'clock.svg" class="fa-svg event-li-icon event-li-clock">' + startDateTime
    }
    else {
        startTimeDisplay = '<img alt="" src="' + faPath + 'calendar.svg" class="fa-svg event-li-icon">' + startDateDay;
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
        if (endDateDay == startDateDay) {
            if (startDateTime == endDateTime) {
                startTimeDisplay = startTimeDisplay + ' alkaen ';
            }
            else {
                startTimeDisplay = startTimeDisplay + ' – '  + endDateTime;
            }
        }
        else {
            var endTimeDisplay = "";

            if (endDateTime !== "") {
                endTimeDisplay = '<img alt="" src="' + faPath + 'clock.svg" class="fa-svg event-li-icon event-li-clock">' + endDateTime
            }
            endDateTimeDisplay = '– <span class="event-end-time"> ' +  endDateDay +
                endTimeDisplay + '</span>';

            endDateTimeDisplay = '<i class="start-end-divider">–</i><img alt="" src="' + faPath + 'calendar.svg" class="fa-svg event-li-icon"> ' +  endDateDay +
                endTimeDisplay;

        }
    }
    else {
        if (!startDateTime == "") {
            endDateTimeDisplay = " alkaen"
        }
    }


    var dateDisplayRow = '<span class="event-li-time">' +
        startTimeDisplay + endDateTimeDisplay;
    '</span>';

    var itemImg = "";
    if (event.image !== null && event.image !== false) {
        itemImg = '<img class="event-image" loading="lazy" alt="" src="' + event.image + '">'
    }
    else {
        // TO DO: No image...
    }
    var itemTitle = event.title;
    if (isEnglish && event.english_title !== null && event.english_title != "") {
        itemTitle = event.english_title;
    }
    var itemContent = event.content;
    if (isEnglish && event.english_content !== null && event.english_content != "") {
        itemContent = event.english_content;
    }


    var eventLocation = "";

    var customLocation = "";
    var customLocationObject = [];

    if (event.custom_address) {
        var customLocationData = event.custom_address;
        var customPlace = customLocationData.name;
        var customStreet = customLocationData.street_name;
        var customStreetNumber = customLocationData.street_number;
        var customZipcode = customLocationData.post_code;
        var customCity = customLocationData.city;

        // Google maps returns place name as: Placename, address. If there is no Placename, only address is returned.
        var startOfPlace = customPlace.slice(0, 4);
        var startOfAddress = customStreet.slice(0, 4);
        if (startOfPlace == startOfAddress) {
            customPlace = customPlace + ', ' + customCity;
        }

        //customLocation = customPlace + ", " + customStreet + " " + customStreetNumber + ", " + customCity;
        customLocation = customPlace;
        var customCoordinates = { lat: customLocationData.lat, lon: customLocationData.lng };
        var customAddressObject = { street: customStreet + ' ' + customStreetNumber, zipcode: customZipcode };


        if (customCity != null) {
            //eventCityList.push(customCity);
        }

        customLocationObject.push ({ location: customPlace, coordinates: customCoordinates,
            city: customCity, address: customAddressObject });

    }


    for (var i = 0; i < event.organizer.length; i++) {
        // Check if libraryList contains the ID.
        var organizerIsLibrary = false;
        for (var x=0; x<libraryList.length; x++) {
            if (event.organizer[i] == libraryList[x].id) {
                // Replace the id with city name.
                var street = libraryList[x].street;
                var zipcode = libraryList[x].zipcode;
                var city = libraryList[x].city;

                var addressObject = { street: street, zipcode: zipcode };
                event.organizer[i] = { location: libraryList[x].text, coordinates: libraryList[x].coordinates,
                    city: city, address: addressObject };
                eventCityList.push(libraryList[x].city);
                organizerIsLibrary = true;
            }
        }
        if (!organizerIsLibrary) {
            /*
            0 = "Other"
            1 = "Keski-libraries"
            2 = "Web event"
             */
            if (event.organizer[i] == 0) {
                // TO DO: Other
                //event.organizer[i] = { location: libraryList[x].text, coordinates: libraryList[x].coordinates,
                //    city: libraryList[x].city };
            }
            else if (event.organizer[i] == 1) {
                event.organizer[i] = { location: "Keski-kirjastot", coordinates: null,
                    city: null };
            }
            else if (event.organizer[i] == 2) {
                //event.organizer[i] = { location: i18n.get('Web event'), coordinates: null,
                event.organizer[i] = { location: i18n.get('Web event'), coordinates: null,

                    city: null };
                console.log(event.organizer[i]);
                eventCityList.push(i18n.get('Web event'));

            }
        }
    }
    if (event.organizer.length > 1) {
        eventLocation = event.organizer.length + " tapahtumapaikkaa"
    }
    else {
        if (event.organizer[0] !== undefined) {
            eventLocation = event.organizer[0].location;
        }
        else {
            // TO DO: No event location?
            eventLocation = "Muu tapahtumapaikka"
        }
    }

    // Accessible icons: https://fontawesome.com/how-to-use/on-the-web/other-topics/accessibility
    // Add price where available.
    if (event.price != "") {
        eventPrice = event.price + " €";
        //eventPrice = '<span class="event-price">' + eventPrice + '</span>';
        eventPrice = '<span class="event-info event-price" aria-label="' + i18n.get("Price") + '">' +
            '<img data-toggle="tooltip" title="' + i18n.get("Price") + '" data-placement="top" alt="" ' +
            'src="' + faPath + 'money-bill-alt.svg" class="fa-svg event-details-icon">'  + eventPrice + '</span>';
    }
    // Website
    var itemLink = "";
    if (event.link_url !== null && event.link_url != "") {
        var prettyUrl = generatePrettyUrl(event.link_url);
        itemLink = '<span class="event-info event-link" aria-label="' + i18n.get("Website") + '">' +
            '<img data-toggle="tooltip" title="' + i18n.get("Website") + '" data-placement="top" alt="" ' +
            'src="' + faPath + 'globe.svg" class="fa-svg event-details-icon"><a href="' + event.link_url + '">'
            + prettyUrl + '</a></span>';
    }


    var locationData = event.organizer;
    if(customLocation !== "") {
        eventLocation = customLocation;
        locationData = customLocationObject;
    }


    var itemLocation = '<span class="event-info event-location" aria-label="Location">' +
        '<img data-toggle="tooltip" title="Location" data-placement="top" alt="" ' +
        'src="' + faPath + 'map-marker-alt.svg" class="fa-svg event-details-icon">' + eventLocation + '</span>';



    function generateLinkToTransitInfo(coordinates, street, zipcode, city, text) {
        var linkToTransitInfo = street + ", "  + city +
            "::" + coordinates.lat + ", "  + coordinates.lon ;

        var infoText = i18n.get("Route and transportation");
        //var infoText = text;
        linkToTransitInfo = "https://opas.matka.fi/reitti/POS/" + linkToTransitInfo;
        linkToTransitInfo = encodeURI(linkToTransitInfo);
        // Matka.fi does not support all cities for public transport details, see: https://www.traficom.fi/fi/asioi-kanssamme/reittiopas
        if(city !== "Jyväskylä") {
            linkToTransitInfo = "https://www.google.com";
            if(lang === "fi") {
                linkToTransitInfo = "https://www.google.fi"
            }
            linkToTransitInfo = linkToTransitInfo + "/maps/dir//";
            linkToTransitInfo = linkToTransitInfo + street + ", "  + zipcode +
                ", " + city + "/@" + coordinates.lat + ", "  + coordinates.lon + ", 15z/";
            infoText = i18n.get("Navigation to location");
        }
        return '<a target="_blank" class="external-navigation-link" href="' + linkToTransitInfo + '">' + infoText + '</a>';
        //$('#transitBody').append('<p><a target="_blank" href="' + linkToTransitInfo + '">' + infoText + '</a></p>')
    }
    var linkToNavigation = "";
    var linksToNavigation = []; // TO DO: Multiple locations.
    if (locationData.length == 1) {
        var location = locationData[0];
        if (location.address != null && location.city != null && location.coordinates != null) {
            linkToNavigation = generateLinkToTransitInfo(location.coordinates, location.address.street, location.address.zipcode, location.city) + ". ";
        }
    }



    var locationInfo = "";
    var locationHelpText = "";
    if (event.location_info != undefined && event.location_info != "") {
        // TO DO: TRANSLATIONS.
        locationHelpText = event.location_info;
        if (locationHelpText.charAt(locationHelpText.length-1) != ".") {
            locationHelpText = locationHelpText + ".";
        }
        /*
        locationHelpText = '<span class="event-info event-location-info" aria-label="' + i18n.get("Event location") + '">' +
            '<img data-toggle="tooltip" title="' + i18n.get("Event location") + '" data-placement="top" alt="" ' +
            'src="' + faPath + 'location-arrow.svg" class="fa-svg event-details-icon">' + locationInfo + '</span>';

         */
    }

    if (linkToNavigation !== "" || locationHelpText !== "") {
        var spacer = "";
        if (linkToNavigation !== "" && locationHelpText !== "") {
            spacer = " "
        }


        locationInfo = '<span class="event-info event-location-info" aria-label="' + i18n.get("Event location") + '">' +
            '<img data-toggle="tooltip" title="' + i18n.get("Event location") + '" data-placement="top" alt="" ' +
            'src="' + faPath + 'location-arrow.svg" class="fa-svg event-details-icon">' + locationHelpText + spacer + linkToNavigation  + '</span>';
    }



    var itemInfoBoxes = '<div class="event-info-box">' +
        dateDisplayRow +
        eventPrice + itemLink + itemLocation + locationInfo +
        '</div>';

    itemContent = '<div class="event-content">' + itemContent + itemInfoBoxes + '</div>';




    locationData = JSON.stringify(locationData);

    var listItem = '<li class="event-li" id="event-' + id + '">' +
        '<a class="event-item-link" href="javascript:void(0);"' + "data-url='" + event.perma_link + "' data-image='" + itemImg + "' " +
        "data-name='" + itemTitle + "' data-message='" + itemContent + "' data-location-text='" + eventLocation + "' data-location='" + locationData + "' data-location-info='" + locationInfo + "'>" +
        '<div class="event-li-img" style="height: 100%; width: auto;">' +
        itemImg +
        '</div>' +
        '<div class="event-li-details">' +
        '<span class="event-li-title">' +
        itemTitle +
        '</span>' +
        dateDisplayRow +
        '<span class="event-li-place">' +
        '<img alt="" src="' + faPath + 'map-marker-alt.svg" class="fa-svg event-li-icon">'  + eventLocation +
        '</span>' +
        '</div>' +
        '</a>' +
        '</li>';


    $('#keskiEventsUl').append(listItem);

    eventCityList = $.unique(eventCityList);

    for (var e=0; e<eventCityList.length; e++) {
        addLocationsToLocationArray(eventCityList[e]);
    }
    allEvents.push( { id: id, tags: tagIdList, city: eventCityList, url: event.perma_link });

}

// ARGS: Date in dd.mm.YYYY hh.mm (eq. 17.03.2020 14.00)
function formatEventTimeToDate(rawDate) {
    // 10 first chars = date.
    var startDateDay = rawDate.substr(0, 10);
    // 5 last chars = time.
    var startDateTime = rawDate.slice(-5);

    var day = startDateDay.substr(0, 2);
    var month = startDateDay.substr(3, 2);
    var year = startDateDay.substr(6, 4);

    var hours = startDateTime.substr(0, 2);
    var minutes = startDateTime.substr(3, 2);


    var standardDate = new Date();
    standardDate.setDate(day);
    standardDate.setMonth(month -1);
    standardDate.setYear(year);
    standardDate.setHours(0);
    standardDate.setMinutes(1);

    return standardDate;
}

function generateFilters() {
    if (!isEnglish) {
        eventTags.sort((a, b) => a.nameFi.localeCompare(b.nameFi))
    }
    else {
        eventTags.sort((a, b) => a.nameEn.localeCompare(b.nameEn))
    }
    // Sort tags and generate.
    for (var i = 0; i < eventTags.length; i++) {
        //generateEventItem(events[i].acf);
        var tagId = eventTags[i].id;
        $('.event-tags-fieldset').append('<div id="tag_' + tagId + '" class="tag-checkbox-container">' +
            '<label class="pure-material-checkbox">' +
            '<input type="checkbox" name="tags" value="' + tagId + '">' +
            '<span>' + eventTags[i].nameFi + '</span>' +
            '</label>' +
            '</div>');
    }
    // Sort locations and generate.
    eventLocations.sort((a, b) => a.id.localeCompare(b.id))
    for (var x = 0; x < eventLocations.length; x++) {
        //generateEventItem(events[i].acf);
        var cityName = eventLocations[x].id;
        $('.event-locations-fieldset').append('<div id="location_' + cityName + '" class="location-checkbox-container">' +
            '<label class="pure-material-checkbox">' +
            '<input id="' + cityName + '" type="checkbox" name="location" value="' + cityName + '">' +
            '<span>' + cityName + '</span>' +
            '</label>' +
            '</div>');
    }
    bindFilterEvents();
    // Hide the loader, display the filters.
    $('.loader').hide();
    $('.event-filters').css('visibility', 'visible');
}

function bindEventListEvents() {
    $(".event-item-link").on('click', function (e) {
        var popupTitle = $(this).data('name');
        var popupText = $(this).data('message');
        var locationText = $(this).data('location-text');
        var locationData = $(this).data('location');
        var locationInfo = $(this).data('location-info');
        var image = $(this).data('image');
        // Remove multiple spaces
        popupText = popupText.replace(/^(&nbsp;)+/g, '');
        // This would remove br from <br>*:  popupText = popupText.replace(/(<|&lt;)br\s*\/*(>|&gt;)/g, ' ');
        // Remove empty paragraphs
        popupText = popupText.replace(/(<p>&nbsp;<\/p>)+/g, "");
        popupText = popupText.replace(/(<p><\/p>)+/g, "");
        popupText = popupText.replace(/(<p>\s<\/p>)+/g, "");


        /* Generate location info & map. */
        var itemLocation = '<p class="event-info event-location" aria-label="' + i18n.get("Event location") + '">' +
            '<img data-toggle="tooltip" title="' + i18n.get("Event location") + '" data-placement="top" alt="" ' +
            'src="' + faPath + 'map-marker.svg" class="fa-svg event-details-icon">' + locationText + '</p>';



        // Check if large or small text/modal.
        $('#eventModalTitle').replaceWith('<h1 class="modal-title" id="eventModalTitle">' + popupTitle + '</h1>');

        $("#eventDescription").replaceWith(
            '<div id="eventDescription">' +
            '<div> ' +
            '<div class="feed-content">' +
            '<div class="holder">' + popupText  + '</div>' +
            '</div>' +
            '</div' +
            '></div>');

        if (locationText !== "Verkkotapahtuma") {
            $('#mapRow').css('display', 'block');
            asyncGenerateEventMap(locationData);
        }
        else {
            $('#mapRow').css('display', 'none');
        }

        $('#eventImageContainer').html('<div id="eventImageContainer">' + image + '</div>');
        // Show modal.
        //console.log("e.pageY " + e.pageY + " | ta "  +offSet);
        $('#eventModal').modal('show');

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

    // Open the event if url contains an event link.
    var pageUrl = window.location.href;
    console.log(pageUrl);

    if (pageUrl.indexOf('?event=') > -1) {
        // If we use simple indexOf match articles that contain other articles names are problematic,
        // eg. event=test and event=test-2
        var reMatchEvents = new RegExp(/\?event=.*/g);
        var matchingEventInUrl = pageUrl.match(reMatchEvents)[0];
        console.log(allEvents);
        for (var i = 0; i < allEvents.length; i++) {
            var toMatch = "?event=" + allEvents[i].url;
            if(matchingEventInUrl === toMatch) {
                var toClick = allEvents[i].url;
                setTimeout(function(){
                    $('[data-url="'+ toClick +'"]').click();
                }, 1400);
            }
        }
    }

    $("#eventModal").on('hide.bs.modal', function(){
        var pageUrl = window.location.href;
        if (pageUrl.indexOf('?event=')) {
            var reMatchEvents = new RegExp(/\?event=.*/g);
            pageUrl = pageUrl.replace(reMatchEvents, '');
            var stateObj = { urlValue: pageUrl };
            history.replaceState(stateObj, '', pageUrl);

        }
    });
}


function generateEventList(events) {
    // Sort events and generate.
    events.sort(function(a, b) {
        var dateA = formatEventTimeToDate(a.acf.start_date),
            dateB = formatEventTimeToDate(b.acf.start_date);
        return dateA - dateB;
    });
    for (var i = 0; i < events.length; i++) {
        generateEventItem(events[i].acf, events[i].id);
    }
    bindEventListEvents();
    generateFilters();
}

var eventMap;
var layerGroup = null;

function addCoordinatesToMap(locations) {
    var addCoordinatesDeferred = jQuery.Deferred();
    setTimeout(function() {
        if(locations.length !== 0) {


            var lastCoordinates = null;
            var markerIcon = L.divIcon({
                html: '<img data-toggle="tooltip" title="' + i18n.get("Event location") + '" alt="" ' +
                    'src="' + faPath + 'book-reader.svg" class="fa-svg fa-leaflet-map-marker">',
                iconSize: [24, 24],
                popupAnchor:  [0, 3], // point from which the popup should open relative to the iconAnchor
                //popupAnchor:  [-88, 3], // point from which the popup should open relative to the iconAnchor
                className: 'event-map-marker'
            });

            var counter = 0;
            for (var i = 0; i < locations.length; i++) {

                var placeName = locations[i].location;

                if (placeName == "Verkkotapahtuma" || placeName == "Web event") {
                    $('#mapRow').css('display', 'none');
                    addCoordinatesDeferred.resolve();
                    return;
                }


                if (locations[i].address != undefined ) {
                    if(placeName.indexOf(locations[i].address.street) > -1) {
                        console.log("Location includes place street.")
                        placeName = "";
                    }
                    else {
                        placeName = '<strong>' + locations[i].location + '</strong><br>';
                    }
                }
                else {
                    placeName = '<strong>' + locations[i].location + '</strong><br>';
                }

                var text = placeName +
                    locations[i].address.street + ', <br>' + locations[i].address.zipcode + ', ' + locations[i].city;
                if (locations[i].coordinates != null) {
                    L.marker([locations[i].coordinates.lat, locations[i].coordinates.lon], {icon: markerIcon}).addTo(layerGroup)
                        .bindPopup(text, {autoClose: false, autoPan: false})
                        .openPopup();
                }
                counter = counter +1;
                if(counter === locations.length){
                    lastCoordinates = { lat: locations[i].coordinates.lat, lon: locations[i].coordinates.lon };
                    eventMap.whenReady(() => {
                        setTimeout(() => {
                            // Set map view and open popups.
                            eventMap.invalidateSize();
                            eventMap.setView([lastCoordinates.lat, lastCoordinates.lon], 10.5);
                            layerGroup.eachLayer(function (layer) {
                                layer.openPopup();
                            });

                        }, 250);
                    });
                    addCoordinatesDeferred.resolve();
                }
            }
        }
    }, 1 );
    // Return the Promise so caller can't change the Deferred
    return addCoordinatesDeferred.promise();
}

function asyncGenerateEventMap(locations) {
    var mapDeferred = jQuery.Deferred();
    setTimeout(function() {
        if(!eventMap) {
            eventMap = L.map('eventMapContainer');
            // Add fallback layer to the default titles in case something goes wrong (err 429 etc.)
            L.tileLayer.fallback('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(eventMap);
            //L.tileLayer('https://map-api.finna.fi/v1/rendered/{z}/{x}/{y}.png').addTo(map); < Blocked for non-finna.
            // Limitations: free usage for up to 75,000 mapviews per month, none-commercial services only. For bigger usage and other cases contact CARTO sales for enterprise service key.
            //L.tileLayer.fallback('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(eventMap);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(eventMap);

            //L.tileLayer('https://map-api.finna.fi/v1/rendered/{z}/{x}/{y}.png').addTo(eventMap); // Blocked for non-finna.
            // Min/max zoom levels + default focus.
            eventMap.options.minZoom = 6;
            eventMap.options.maxZoom = 18;
            eventMap.setView(["62.750", "25.700"], 10.5);

            layerGroup = L.layerGroup().addTo(eventMap);


            // Set the contribution text.
            $('.leaflet-control-attribution').replaceWith('<div class="leaflet-control-attribution leaflet-control">© <a target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a target="_blank" href="https://carto.com/attributions">CARTO</a></div>');
        }
        else {
            layerGroup.clearLayers();

        }




        $.when( addCoordinatesToMap(locations) ).then(
            function() {

                // If we are in the contacts tab, set map view.
                // If we try to set view & open the popup in asyncLoadMap, things get messed.

                /*
                if(lat !== undefined) {
                    map.setView([lat, lon], 16);
                } else {
                    map.setView(["62.750", "25.700"], 6);
                }
                */
                //eventMap.setView(["62.750", "25.700"], 6);

                mapDeferred.resolve();
            });

    }, 1 );
    // Return the Promise so caller can't change the Deferred
    return mapDeferred.promise();
}



function asyncReplaceIdWithCity() {
    var citiesDeferred = jQuery.Deferred();
    setTimeout(function() {
        try {
            // Fetch names of all cities in kirkanta.
            $.getJSON("https://api.kirjastot.fi/v4/city?lang=fi&limit=1500", function(data) {
                var counter = 0;

                for (var i = 0; i < data.items.length; i++) {
                    // Check if libraryList contains the ID.
                    for (var x=0; x<libraryList.length; x++) {
                        if (libraryList[x].city == data.items[i].id.toString()) {
                            // Replace the id with city name.
                            libraryList[x].city = data.items[i].name;
                        }
                    }
                    counter = counter +1;
                    if(counter === data.items.length) {
                        // Sort or the city listing wont be in  correct order...
                        libraryList.sort(function(a, b){
                            if(a.city < b.city) { return -1; }
                            if(a.city > b.city) { return 1; }
                            return 0;
                        });
                        citiesDeferred.resolve();

                    }
                }
            });
        }
        catch (e) {
            console.log("Error in fetching cities: " + e);
        }
    }, 1 );
    // Return the Promise so caller can't change the Deferred
    return citiesDeferred.promise();
}



$(document).ready(function() {
    isEventsPage = $('.events-page').length === 1;
    if (isEventsPage) {
        if (document.documentElement.lang == "en-gb" ) {
            isEnglish = true;
        }
        $.when( fetchConsortiumLibraries(2113) ).then  (
            function() {
                $.when( asyncReplaceIdWithCity() ).then  (
                    function() {
                        fetchEvents();
                        $(".close-event-modal").text(i18n.get("Close"));
                    }
                )
            }
        )
    }
});

