"use strict";

var materialClass = "pure-material-checkbox";
if (navigator.userAgent.indexOf('MSIE ') > -1 || navigator.userAgent.indexOf('Trident/') > -1) {
    materialClass = "";
}

var isEventsPage = false;
var isEventsFrontPage = false;
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
    setTimeout(function () {
        $.getJSON("https://api.kirjastot.fi/v4/library?lang=" + lang + "&consortium=" + consortium + "&limit=1500", function (data) {
            for (var i = 0; i < data.items.length; i++) {
                // Include mobile libraries in consortium listings...
                libraryList.push({
                    id: data.items[i].id,
                    text: data.items[i].name,
                    city: data.items[i].city.toString(),
                    street: data.items[i].address.street,
                    zipcode: data.items[i].address.zipcode,
                    coordinates: data.items[i].coordinates,
                    services: JSON.stringify(data.items[i].services)
                });
                // Wiitaunion mobile library is used in both "Pihtipudas (85449)" and "Viitasaari".
                if (data.items[i].id == 85449) {
                    libraryList.push({
                        id: data.items[i].id,
                        text: data.items[i].name,
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
    }, 1); // Return the Promise so caller can't change the Deferred

    return consortiumLibListDeferred.promise();
}

// Adds tags to eventTags array if they do not already exists. Increases type count if already exists.
function addTagToTagArray(tag) {
    var tagAlreadyExists = false;
    for (var t = 0; t < eventTags.length; t++) {
        if (eventTags[t].id == tag.id) {
            eventTags[t].count = eventTags[t].count + 1;
            tagAlreadyExists = true;
        }
    }
    if (!tagAlreadyExists) {
        eventTags.push({
            id: tag.id,
            nameFi: tag.fi,
            nameEn: tag.en,
            count: 1
        });
    }
}

// Adds location to eventLocations array if they do not already exists. Increases count if already exists.
function addLocationsToLocationArray(location) {
    var locationAlreadyExists = false;
    for (var t = 0; t < eventLocations.length; t++) {
        if (eventLocations[t].id == location) {
            eventLocations[t].count = eventLocations[t].count + 1;
            locationAlreadyExists = true;
        }
    }
    if (!locationAlreadyExists) {
        eventLocations.push({
            id: location,
            count: 1
        });
    }
}

var checkedTags = [];
var checkedLocations = [];

function locationExists(location) {
    return filteredEvents.some(function (el) {
        return el.city == location;
    });
}

function tagExists(tag) {
    return filteredEvents.some(function (el) {
        return el.tags == tag;
    });
}

function filterEvents(triggeredByTagFilter) {
    filteredEvents = [];
    for (var i = 0; i < allEvents.length; i++) {
        var foundTag = true;
        var foundLocation = true;
        if (checkedTags.length !== 0) {
            foundTag = checkedTags.some(function (r) {
                return allEvents[i].tags.includes(r);
            });
        }
        if (checkedLocations.length !== 0) {
            foundLocation = checkedLocations.some(function (r) {
                return allEvents[i].city.includes(r);
            });
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
        $.each($('.location-checkbox-container'), function () {
            var locationFilterId = $(this)[0].id;
            var cleanLocationId = locationFilterId.replace("location_", ""); //filteredEvents.push(allEvents[i]);
            var filterdEventsIncludesCity = locationExists(cleanLocationId);
            if (!filterdEventsIncludesCity) {
                //$(this).addClass('hidden-filter')
            }
            else {
                //$(this).removeClass('hidden-filter')
            }
        });
    }
    else {
        $.each($('.tag-checkbox-container'), function () {
            var tagFilterId = $(this)[0].id;
            var cleanTagId = tagFilterId.replace("tag_", "");
            var filterdEventsIncludesTag = tagExists(cleanTagId);

            if (!filterdEventsIncludesTag) {
                //$(this).addClass('hidden-filter')
            }
            else {
                $(this).removeClass('hidden-filter');
            }
        });
    }

    $('.events-section-title').replaceWith('<h1 class="events-page-title events-section-title">' + i18n.get('Events') +
        ' <span class="events-count-small"> (' + filteredEvents.length  + ')</span></h1>');
}

function bindFilterEvents() {
    // When tag checkbox is changed, empty the checkedTags array and trigger the filtering with the new selected items.
    $('input[name="tags"]').change(function () {
        checkedTags = [];
        $.each($("input[name='tags']:checked"), function () {
            checkedTags.push(parseInt($(this).val())); // Parse to int in order to avoid "1" and 1 not matching.
        });
        filterEvents(true);
    });
    // Event location.
    $('input[name="location"]').change(function () {
        checkedLocations = [];
        $.each($("input[name='location']:checked"), function () {
            checkedLocations.push($(this).val());
        });
        filterEvents();
    });

    if (window.innerWidth > 800) {
        $('#toggleEventFilters').click();
    }
}

function fetchEvents() {
    $.ajax("https://keski-finna.fi/wp-json/acf/v3/events?per_page=500", {
        accepts: {
            xml: "application/json"
        },
        dataType: "json",
        success: function success(data) {
            generateEventList(data);
        },
        error: function error(request, status, _error) {
            console.log(_error);
        },
        complete: function complete() {}
    });
}

function generateTags(tags) {
    var tagDisplay = '';
    var tagIdList = [];
    for (var t = 0; t < tags.length; t++) {
        var tagsJson = JSON.parse(tags[t]);
        tagIdList.push(tagsJson.id);
        addTagToTagArray(tagsJson);
        if (!isEnglish) {
            var tagEnd = ", ";
            if (t == tags.length - 1 || tags.length == 1) {
                tagEnd = "";
            }
            else if (t == tags.length - 2) {
                tagEnd = " & ";
            }
            var casedTag = tagsJson.fi;
            if (t != 0) {
                casedTag = casedTag.toLowerCase();
            }
            tagDisplay = tagDisplay + casedTag + tagEnd;
        }
        else {
            tagDisplay = tagDisplay + tagsJson.en + ". ";
        }
    }
    tagDisplay = '<span class="event-detail event-tags" aria-label="' + i18n.get("Event category") + '">' +
        '<img data-toggle="tooltip" title="' + i18n.get("Event category") + '" data-placement="top" alt="" ' +
        'src="' + faPath + 'tags.svg" class="fa-svg event-details-icon">' + tagDisplay + '</span>';
    return { tagList: tagIdList, tagDisplay: tagDisplay };
}

function generateEventTimeDisplay(start, end) {
    // 10 first chars = date.
    var startDay = start.substr(0, 10);
    // 5 last chars = time.
    var startTime = start.slice(-5);
    // If 00.00 = no specified start time.
    if (startTime === "00.00") {
        startTime = null;
    }
    var endDay = null;
    var endTime = null;
    // Check if ending time is provided.
    if (end !== null && end !== "") {
        endDay = end.substr(0, 10);
        if (end.slice(-5) != "00.00") {
            endTime = end.slice(-5);
        }
    }

    var sameEndingDay = true;
    if (endDay !== null) {
        if (endDay != startDay) {
            sameEndingDay = false;
        }
    }
    /******************************************
     needsTwoRows:
     Date + start time = false
     Date to date = false
     Date + Start time to end time = true
     ******************************************/
    var needsTwoRows = false;
    var startDayDisplay = '<img alt="" src="' + faPath +
        'calendar.svg" class="fa-svg event-details-icon"> ' + startDay;
    if (startTime != null) {
        startDayDisplay = startDayDisplay + '<img alt="" src="' + faPath +
            'clock.svg" class="fa-svg event-details-icon event-li-clock"> ' + startTime
    }
    var endDayDisplay = '';
    if (endDay != null) {
        // Same ending day, different time.
        if (sameEndingDay && endTime != null) {
            endDayDisplay = endTime;
        }
        // Same ending day, no time
        else if (sameEndingDay && endTime == null) {
            endDayDisplay = '';
            startDayDisplay = startDayDisplay + i18n.get('Starting');
        }
        // Ends on different day and has no ending time.
        else if (!sameEndingDay && endTime == null) {
            endDayDisplay = endDay
        }
        // Ends on different day and has ending time
        else if (!sameEndingDay && endTime != null) {
            endDayDisplay = '<img alt="" src="' + faPath +
                'calendar.svg" class="fa-svg event-details-icon"> ' + endDay;
            endDayDisplay = endDayDisplay + '<img alt="" src="' + faPath +
                'clock.svg" class="fa-svg event-details-icon event-li-clock"> ' + endTime;
            needsTwoRows = true;
        }
    }
    else {
        startDayDisplay = startDayDisplay + i18n.get('Starting');
    }
    var startEndDivider = '';

    if (endDayDisplay !== '') {
        startEndDivider = '<i class="start-end-divider"> – </i>';
    }

    if (needsTwoRows) {
        startDayDisplay = '<span class="event-time-row event-start-row">' + startDayDisplay +  startEndDivider + '</span>';
        endDayDisplay = '<span class="event-time-row event-end-row">' + endDayDisplay + '</span>';
        startEndDivider = '';
    }
    return '<div class="event-date-container">' + startDayDisplay + startEndDivider + endDayDisplay + '</div>';
}

function generateEventItem(event, id) {
    var tags = [];
    var tagIdList = [];
    var eventPrice = "";
    var eventLocation = "";
    var eventCityList = [];
    var tagDisplay = "";
    if (event.tags.length !== 0) {
        tags = generateTags(event.tags);
        tagDisplay = tags.tagDisplay;
        tagIdList = tags.tagList;
    }

    var eventTimeDisplay = generateEventTimeDisplay(event.start_date, event.end_date)


    var itemImg = "";
    // Default image.
    if (event.image == false) {
        event.image = "https://keski-finna.fi/wp-content/uploads/keskifinna_kuvapankki_poikalaulaakovaa-1024x683.jpg"
    }
    if (event.image !== null && event.image !== false) {
        itemImg = '<img class="event-image" loading="lazy" alt="" src="' + event.image + '">';
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
        var customStreet = customLocationData.street_name;
        var customStreetNumber = customLocationData.street_number;
        var customZipcode = customLocationData.post_code;
        var customCity = customLocationData.city;

        var customPlace = customLocationData.name;
        if (customPlace == undefined) {
            customPlace = "";
        }
        else {
            var startOfPlace = customPlace.slice(0, 4);
            var startOfAddress = customStreet.slice(0, 4);

            if (startOfPlace == startOfAddress) {
                customPlace = customPlace + ', ' + customCity;
            }
        }

        customLocation = customPlace;
        var customCoordinates = {
            lat: customLocationData.lat,
            lon: customLocationData.lng
        };
        var customAddressObject = {
            street: customStreet + ' ' + customStreetNumber,
            zipcode: customZipcode
        };

        if (customCity != null) {//eventCityList.push(customCity);
        }

        customLocationObject.push({
            location: customPlace,
            coordinates: customCoordinates,
            city: customCity,
            address: customAddressObject
        });
    }

    for (var i = 0; i < event.organizer.length; i++) {
        // Check if libraryList contains the ID.
        var organizerIsLibrary = false;
        for (var x = 0; x < libraryList.length; x++) {
            if (event.organizer[i] == libraryList[x].id) {
                // Replace the id with city name.
                var street = libraryList[x].street;
                var zipcode = libraryList[x].zipcode;
                var city = libraryList[x].city;
                var addressObject = {
                    street: street,
                    zipcode: zipcode
                };
                event.organizer[i] = {
                    location: libraryList[x].text,
                    coordinates: libraryList[x].coordinates,
                    city: city,
                    address: addressObject
                };
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
                event.organizer[i] = {
                    location: i18n.get('Other location'),
                    coordinates: null,
                    city: null
                };
                eventCityList.push(i18n.get('Other location'));
            }
            else if (event.organizer[i] == 1) {
                event.organizer[i] = {
                    location: i18n.get('Keski Libraries'),
                    coordinates: null,
                    city: null
                };
                eventCityList.push(i18n.get('Keski Libraries'));
            }
            else if (event.organizer[i] == 2) {
                //event.organizer[i] = { location: i18n.get('Web event'), coordinates: null,
                event.organizer[i] = {
                    location: i18n.get('Web event'),
                    coordinates: null,
                    city: null
                };
                eventCityList.push(i18n.get('Web event'));
            }
        }
    }

    if (event.organizer.length > 1) {
        eventLocation = event.organizer.length + " " + i18n.get('event locations');
    }
    else {
        if (event.organizer[0] !== undefined) {
            eventLocation = event.organizer[0].location;
        }
        else {
            // TO DO: No event location?
            eventLocation = i18n.get('Other location');
        }
    }
    // Accessible icons: https://fontawesome.com/how-to-use/on-the-web/other-topics/accessibility
    // Add price where available.
    if (event.price != "") {
        eventPrice = event.price + " €"; //eventPrice = '<span class="event-price">' + eventPrice + '</span>';
        eventPrice = '<span class="event-detail event-price" aria-label="' + i18n.get("Price") + '">' + '<img data-toggle="tooltip" title="' + i18n.get("Price") + '" data-placement="top" alt="" ' + 'src="' + faPath + 'money-bill-alt.svg" class="fa-svg event-details-icon">' + eventPrice + '</span>';
    }
    // Website
    var itemLink = "";
    if (event.link_url !== null && event.link_url != "") {
        var prettyUrl = generatePrettyUrl(event.link_url);
        itemLink = '<span class="event-detail event-link" aria-label="' + i18n.get("Website") + '">' + '<img data-toggle="tooltip" title="' + i18n.get("Website") + '" data-placement="top" alt="" ' + 'src="' + faPath + 'globe.svg" class="fa-svg event-details-icon"><a href="' + event.link_url + '">' + prettyUrl + '</a></span>';
    }

    var locationData = event.organizer;

    if (customLocation !== "") {
        eventLocation = customLocation;
        locationData = customLocationObject;
    }

    var itemLocation = '<span class="event-detail event-location" aria-label="Location">' +
        '<img data-toggle="tooltip" title="' + i18n.get("Location") + '" data-placement="top" alt="" ' +
        'src="' + faPath + 'map-marker-alt.svg" class="fa-svg event-details-icon">' + eventLocation + '</span>';

    function generateLinkToTransitInfo(coordinates, street, zipcode, city, text) {
        var linkToTransitInfo = street + ", " + city + "::" + coordinates.lat + ", " + coordinates.lon;
        var infoText = i18n.get("Route and transportation"); //var infoText = text;

        linkToTransitInfo = "https://opas.matka.fi/reitti/POS/" + linkToTransitInfo;
        linkToTransitInfo = encodeURI(linkToTransitInfo); // Matka.fi does not support all cities for public transport details, see: https://www.traficom.fi/fi/asioi-kanssamme/reittiopas

        if (city !== "Jyväskylä") {
            linkToTransitInfo = "https://www.google.com";

            if (!isEnglish) {
                linkToTransitInfo = "https://www.google.fi";
            }

            linkToTransitInfo = linkToTransitInfo + "/maps/dir//";
            linkToTransitInfo = linkToTransitInfo + street + ", " + zipcode + ", " + city + "/@" + coordinates.lat + ", " + coordinates.lon + ", 15z/";
            infoText = i18n.get("Navigation to location");
        }

        return '<a target="_blank" class="external-navigation-link" href="' + linkToTransitInfo + '">' + infoText + '</a>'; //$('#transitBody').append('<p><a target="_blank" href="' + linkToTransitInfo + '">' + infoText + '</a></p>')
    }

    // Generate the transit info.
    var linkToNavigation = "";
    var linksToNavigation = []; // TO DO: Multiple locations.
    if (locationData.length == 1) {
        var location = locationData[0];
        if (location.address != null && location.city != null && location.coordinates != null) {
            linkToNavigation = generateLinkToTransitInfo(location.coordinates, location.address.street, location.address.zipcode, location.city);
        }
    }
    if (linkToNavigation != "") {
        linkToNavigation = '<span class="event-detail event-transit" aria-label="' + i18n.get("Navigation to location") + '">' +
            '<img data-toggle="tooltip" title="' + i18n.get("Navigation to location") + '" data-placement="top" ' +
            'alt="" ' + 'src="' + faPath + 'directions.svg" class="fa-svg event-details-icon">' + linkToNavigation + '</span>';
    }

    // Generate modal infoboxes.
    // If the event location is the library, do not display this information in the event list.
    var locationInfo = "";
    var locationHelpText = "";
    if (lang === "en") {
        if (event.english_location_info != "" && event.english_location_info != undefined) {
            locationHelpText = event.english_location_info;
            if (locationHelpText.charAt(locationHelpText.length - 1) != ".") {
                locationHelpText = locationHelpText + ".";
            }
        }
    }
    if (event.location_info != "" && event.location_info != undefined && locationHelpText == "") {
        locationHelpText = event.location_info;
        if (locationHelpText.charAt(locationHelpText.length - 1) != ".") {
            locationHelpText = locationHelpText + ".";
        }
    }
    if (locationHelpText !== "") {
        locationInfo = '<span class="event-detail event-location-info" aria-label="' + i18n.get("Location information") + '">' +
            '<img data-toggle="tooltip" title="' + i18n.get("Location information") + '" data-placement="top" alt="" ' +
            'src="' + faPath + 'location-arrow.svg" class="fa-svg event-details-icon">' + locationHelpText + '</span>';
    }

    itemContent = '<div class="event-content"><div class="event-modal-description">' + itemContent +
        '<div class="event-info-box">' + tagDisplay + eventPrice + itemLink + '</div></div></div>';
    var eventFrontPageClass = "";
    if (isEventsFrontPage) {
        eventFrontPageClass = "front-page-event"
    }
    locationData = JSON.stringify(locationData);
    var listItem = '<li class="event-li ' + eventFrontPageClass + '" id="event-' + id + '">' +
        '<a class="event-item-link" href="javascript:void(0);"' + "data-url='" + event.perma_link + "' " +
        "data-image='" + itemImg + "' " + "data-name='" + itemTitle + "' data-time='" + eventTimeDisplay + "' data-message='" + itemContent + "' " +
        "data-location-text='" + eventLocation + "' data-location='" + locationData + "' data-location-info='" +
        locationInfo + "' data-transit='" + linkToNavigation + "'>" + '<div class="event-li-img" style="height: 100%; width: auto;">' + itemImg + '</div>'
        + '<div class="event-li-details">' + '<span class="event-li-title">' + itemTitle + '</span>' + eventTimeDisplay +
        '<span class="event-li-place">' + '<img alt="" src="' + faPath + 'map-marker-alt.svg" class="fa-svg event-li-icon">' +
        eventLocation + '</span>' + '</div>' + '</a>' + '</li>';
    $('#keskiEventsUl').append(listItem);
    eventCityList = $.unique(eventCityList);

    for (var e = 0; e < eventCityList.length; e++) {
        addLocationsToLocationArray(eventCityList[e]);
    }
    allEvents.push({
        id: id,
        tags: tagIdList,
        city: eventCityList,
        url: event.perma_link
    });
    if (!isFrontPage) {
        // Generate the title.
        $('.events-section-title').replaceWith('<h1 class="events-page-title events-section-title">' + i18n.get('Events') +
            ' <span class="events-count-small"> (' + allEvents.length  + ')</span></h1>');
    }
}

// ARGS: Date in dd.mm.YYYY hh.mm (eq. 17.03.2020 14.00)
function formatEventTimeToDate(rawDate) {
    // 10 first chars = date.
    var startDateDay = rawDate.substr(0, 10); // 5 last chars = time.

    var startDateTime = rawDate.slice(-5);
    var day = startDateDay.substr(0, 2);
    var month = startDateDay.substr(3, 2);
    var year = startDateDay.substr(6, 4);
    var hours = startDateTime.substr(0, 2);
    var minutes = startDateTime.substr(3, 2);
    var standardDate = new Date();
    standardDate.setDate(day);
    standardDate.setMonth(month - 1);
    standardDate.setYear(year);
    standardDate.setHours(0);
    standardDate.setMinutes(1);
    return standardDate;
}

function generateFilters() {
    if (!isEnglish) {
        eventTags.sort(function (a, b) {
            return a.nameFi.localeCompare(b.nameFi, 'fi', { sensitivity: 'base' });
        });
    } else {
        eventTags.sort(function (a, b) {
            return a.nameEn.localeCompare(b.nameEn);
        });
    }
    // Sort tags and generate.
    for (var i = 0; i < eventTags.length; i++) {
        //generateEventItem(events[i].acf);
        var tagId = eventTags[i].id;
        var tagText = eventTags[i].nameFi;
        if (isEnglish) {
            tagText = eventTags[i].nameEn;
        }
        $('#categoryFiltersContent').append('<div id="tag_' + tagId + '" class="tag-checkbox-container">' +
            '<label class="' + materialClass + '">' + '<input type="checkbox" name="tags" value="' +
            tagId + '">' + '<span>' + tagText + '</span>' + '</label>' + '</div>');
    }
    // Sort locations and generate.
    eventLocations.sort(function (a, b) {
        return a.id.localeCompare(b.id, 'fi', { sensitivity: 'base' });
    });

    for (var x = 0; x < eventLocations.length; x++) {
        //generateEventItem(events[i].acf);
        var cityName = eventLocations[x].id;
        $('#locationFiltersContent').append('<div id="location_' + cityName + '" class="location-checkbox-container">' +
            '<label class="' + materialClass + '">' + '<input id="' + cityName + '" type="checkbox" name="location" value="' + cityName + '">' + '<span>' + cityName + '</span>' + '</label>' + '</div>');
    }
    bindFilterEvents();
    // Hide the loader, display the filters.
    $('#keskiEvents .loader').css('display', 'none');
    if (window.innerWidth > 800) {
        var LocationFiltersHeight = $('.event-location-filter').innerHeight() + $('.event-category-filter').innerHeight() + 150;
        $('.event-filters').css('margin-bottom', LocationFiltersHeight + "px");
        // Expand filters on larger screens.
        $('.event-filters .collapsed').click();
        // Eventspage should not be smaller than the filters to prevent overflow to footer.
        $('.events-page').css('min-height', LocationFiltersHeight + "px");
    }
    $('.event-filters').css('visibility', 'visible');
}

function bindEventListEvents() {
    $(".event-item-link").on('click', function (e) {
        var popupTitle = $(this).data('name');
        var time = $(this).data('time');
        var popupText = $(this).data('message');
        var locationText = $(this).data('location-text');
        var locationData = $(this).data('location');
        var locationInfo = $(this).data('location-info');
        var transitInfo = $(this).data('transit');
        var image = $(this).data('image'); // Remove multiple spaces

        popupText = popupText.replace(/^(&nbsp;)+/g, ''); // This would remove br from <br>*:  popupText = popupText.replace(/(<|&lt;)br\s*\/*(>|&gt;)/g, ' ');
        // Remove empty paragraphs
        popupText = popupText.replace(/(<p>&nbsp;<\/p>)+/g, "");
        popupText = popupText.replace(/(<p><\/p>)+/g, "");
        popupText = popupText.replace(/(<p>\s<\/p>)+/g, "");
        /* Generate location info & map. */
        var itemLocation = '<span class="event-detail event-location" aria-label="Location">' +
            '<img data-toggle="tooltip" title="' + i18n.get("Location") + '" data-placement="top" alt="" ' +
            'src="' + faPath + 'map-marker-alt.svg" class="fa-svg event-details-icon">' + locationText + '</span>';


        var locationMetaContainer = '<div class="event-info-box event-location-info-box">' + itemLocation +
            locationInfo + transitInfo + '</div>';


        $('.event-modal-header-text').replaceWith('<div class="event-modal-header-text">' +
            '<h1 class="modal-title" id="eventModalTitle">' + popupTitle + '</h1>' + time + '</div>');
        $("#eventDescription").replaceWith('<div id="eventDescription">' + '<div> ' + '<div class="feed-content">'
            + '<div class="holder">' + popupText + '</div>' + '</div>' + '</div' + '></div>');

        $('#mapRow').css('display', 'block');

        $('.event-location-info-box').replaceWith(locationMetaContainer)

        asyncGenerateEventMap(locationData);

        $('#eventImageContainer').html('<div id="eventImageContainer">' + image + '</div>');
        // Show modal.
        $('#eventModal').modal('show');
        // Update the page url.
        var itemUrl = $(this).data('url').toString();
        var currentUrl = window.location.href.toString(); // Do not add to url if already there.
        if (currentUrl.indexOf(itemUrl) === -1) {
            itemUrl = currentUrl + '?event=' + itemUrl;
            var stateObj = {
                urlValue: itemUrl
            };
            history.replaceState(stateObj, popupTitle, itemUrl);
        }
    });
    // Open the event if url contains an event link.
    var pageUrl = window.location.href;

    if (pageUrl.indexOf('?event=') > -1) {
        // If we use simple indexOf match articles that contain other articles names are problematic,
        // eg. event=test and event=test-2
        var reMatchEvents = new RegExp(/\?event=.*/g);
        var matchingEventInUrl = pageUrl.match(reMatchEvents)[0];
        for (var i = 0; i < allEvents.length; i++) {
            var toMatch = "?event=" + allEvents[i].url;

            if (matchingEventInUrl === toMatch) {
                var toClick = allEvents[i].url;
                setTimeout(function () {
                    $('[data-url="' + toClick + '"]').click();
                }, 1400);
            }
        }
    }

    $("#eventModal").on('hide.bs.modal', function () {
        var pageUrl = window.location.href;

        if (pageUrl.indexOf('?event=')) {
            var reMatchEvents = new RegExp(/\?event=.*/g);
            pageUrl = pageUrl.replace(reMatchEvents, '');
            var stateObj = {
                urlValue: pageUrl
            };
            history.replaceState(stateObj, '', pageUrl);
        }
    });
}

function generateEventList(events) {
    // Sort events and generate.
    events.sort(function (a, b) {
        var dateA = formatEventTimeToDate(a.acf.start_date),
            dateB = formatEventTimeToDate(b.acf.start_date);
        return dateA - dateB;
    });

    var maxEventsToList = events.length;
    if (isEventsFrontPage) {
        maxEventsToList = 4;
        if (window.innerWidth > 767) {
            maxEventsToList = 6;
        }
    }

    for (var i = 0; i < maxEventsToList; i++) {
        if (maxEventsToList !== events.length) {
            var eventStartingDate = events[i].acf.start_date;
            eventStartingDate = moment(eventStartingDate,"DD.MM.YYYY");
            // Display multi-date events for the first two dates. Eq. event between 1-21 of may will be hidden from the front page on 3rd of may at midnight.
            var displayUpTo = eventStartingDate._d;
            displayUpTo.setDate(displayUpTo.getDate() + 2);
            var today = new Date();
            // Increase the max counter in order to show the next event instead.
            if (displayUpTo < today) {
                maxEventsToList = maxEventsToList + 1
            }
            else {
                generateEventItem(events[i].acf, events[i].id);
            }
        }
        // Events page
        else {
            generateEventItem(events[i].acf, events[i].id);
        }
    }
    bindEventListEvents();
    generateFilters();
}

var eventMap;
var layerGroup = null;

function addCoordinateToMap(item) {
    var text = "";
    var street = "";
    var zipcode = "";
    var city = "";
    var placeName = item.location;
    if (item.address != undefined) {

        if (item.address.street != undefined) {
            street = item.address.street;
        }
        if (item.address.zipcode != undefined) {
            zipcode = item.address.zipcode;
        }
        if (placeName.indexOf(item.address.street) > -1) {
            placeName = "";
        }
        else {
            placeName = '<strong>' + item.location + '</strong><br>';
        }
    }
    else {
        placeName = '<strong>' + item.location + '</strong><br>';
    }

    text = placeName + street + ', <br>' + zipcode + ', ' + item.city;
    var markerIcon = L.divIcon({
        html: '<img data-toggle="tooltip" title="' + i18n.get("Event location") + '" alt="" ' + 'src="' + faPath + 'book-reader.svg" class="fa-svg fa-leaflet-map-marker">',
        iconSize: [24, 24],
        popupAnchor: [0, 3],
        // point from which the popup should open relative to the iconAnchor
        //popupAnchor:  [-88, 3], // point from which the popup should open relative to the iconAnchor
        className: 'event-map-marker'
    });
    if (item.coordinates != null) {
        L.marker([item.coordinates.lat, item.coordinates.lon], {
            icon: markerIcon
        }).addTo(layerGroup).bindPopup(text, {
            autoClose: false,
            autoPan: false
        }).openPopup();
    }
}

function addCoordinatesToMap(locations) {
    var addCoordinatesDeferred = jQuery.Deferred();
    setTimeout(function () {
        if (locations.length !== 0) {
            var lastCoordinates = null;
            var counter = 0;
            for (var i = 0; i < locations.length; i++) {
                if (locations[i].coordinates == null) {
                    if (locations.length == 1) {
                        $('#mapRow').css('display', 'none');
                        addCoordinatesDeferred.resolve();
                        return;
                    }
                    counter = counter + 1;
                }
                else {
                    addCoordinateToMap(locations[i]);
                    counter = counter + 1;
                }
                if (counter === locations.length) {
                    try {
                        // Use the index before "Web event" if the location is "Web event"
                        if (locations[i].coordinates == null) {
                            lastCoordinates = {
                                lat: locations[i -1].coordinates.lat,
                                lon: locations[i -1].coordinates.lon
                            };
                        }
                        else {
                            lastCoordinates = {
                                lat: locations[i].coordinates.lat,
                                lon: locations[i].coordinates.lon
                            };
                        }

                        eventMap.whenReady(function () {
                            setTimeout(function () {
                                // Set map view and open popups.
                                eventMap.invalidateSize();
                                var defaultZoom = 12;
                                if (locations.length > 1) {
                                    defaultZoom = 9.5;
                                }
                                eventMap.setView([lastCoordinates.lat, lastCoordinates.lon], defaultZoom);
                                layerGroup.eachLayer(function (layer) {
                                    layer.openPopup();
                                });
                            }, 250);
                        });
                        addCoordinatesDeferred.resolve();
                    }
                    catch (e) {
                        console.log(e);
                        $('#mapRow').css('display', 'none');
                        addCoordinatesDeferred.resolve();
                    }

                }
            }
        }
    }, 1); // Return the Promise so caller can't change the Deferred

    return addCoordinatesDeferred.promise();
}

function asyncGenerateEventMap(locations) {
    var mapDeferred = jQuery.Deferred();
    setTimeout(function () {
        if (!eventMap) {
            eventMap = L.map('eventMapContainer'); // Add fallback layer to the default titles in case something goes wrong (err 429 etc.)

            L.tileLayer.fallback('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(eventMap); //L.tileLayer('https://map-api.finna.fi/v1/rendered/{z}/{x}/{y}.png').addTo(map); < Blocked for non-finna.
            // Limitations: free usage for up to 75,000 mapviews per month, none-commercial services only. For bigger usage and other cases contact CARTO sales for enterprise service key.
            //L.tileLayer.fallback('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(eventMap);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(eventMap); //L.tileLayer('https://map-api.finna.fi/v1/rendered/{z}/{x}/{y}.png').addTo(eventMap); // Blocked for non-finna.
            // Min/max zoom levels + default focus.
            eventMap.options.minZoom = 6;
            eventMap.options.maxZoom = 18;
            eventMap.setView(["62.750", "25.700"], 10.5);
            layerGroup = L.layerGroup().addTo(eventMap); // Set the contribution text.

            $('.leaflet-control-attribution').replaceWith('<div class="leaflet-control-attribution leaflet-control">© <a target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a target="_blank" href="https://carto.com/attributions">CARTO</a></div>');
        }
        else {
            layerGroup.clearLayers();
        }

        $.when(addCoordinatesToMap(locations)).then(function () {
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
    }, 1); // Return the Promise so caller can't change the Deferred

    return mapDeferred.promise();
}

function asyncReplaceIdWithCity() {
    var citiesDeferred = jQuery.Deferred();
    setTimeout(function () {
        try {
            // Fetch names of all cities in kirkanta.
            $.getJSON("https://api.kirjastot.fi/v4/city?lang=fi&limit=1500", function (data) {
                var counter = 0;

                for (var i = 0; i < data.items.length; i++) {
                    // Check if libraryList contains the ID.
                    for (var x = 0; x < libraryList.length; x++) {
                        if (libraryList[x].city == data.items[i].id.toString()) {
                            // Replace the id with city name.
                            libraryList[x].city = data.items[i].name;
                        }
                    }

                    counter = counter + 1;

                    if (counter === data.items.length) {
                        // Sort or the city listing wont be in  correct order...
                        libraryList.sort(function (a, b) {
                            if (a.city < b.city) {
                                return -1;
                            }

                            if (a.city > b.city) {
                                return 1;
                            }

                            return 0;
                        });
                        citiesDeferred.resolve();
                    }
                }
            });
        } catch (e) {
            console.log("Error in fetching cities: " + e);
        }
    }, 1); // Return the Promise so caller can't change the Deferred

    return citiesDeferred.promise();
}

$(document).ready(function () {
    if (document.documentElement.lang == "en-gb") {
        isEnglish = true;
    }
    isEventsPage = $('.events-page').length === 1;
    isEventsFrontPage = $('.events-front-page').length === 1;
    if (isEventsPage || isEventsFrontPage) {
        // Fetch events once the library list is generated.
        $.when(fetchConsortiumLibraries(2113)).then(function () {
            $.when(asyncReplaceIdWithCity()).then(function () {
                fetchEvents();
                // Translate the UI
                if (isEventsFrontPage) {
                    $('.events-section-title').text(i18n.get('Events'));
                    $('.events-front-page-nav-button').text(i18n.get('More events'));
                    $('.events-front-page-nav-button').css('visibility', 'visible');
                }
                else {
                    $('.no-matching-events-div').text(i18n.get('No matching events'));
                    $('.sr-event-filters-title').text(i18n.get('Filter events'));
                    $('#toggleEventFilters').text(i18n.get('Filter events'));
                    $('.event-category-filter-title').text(i18n.get('Category'));
                    $('.event-location-filter-title').text(i18n.get('Location'));
                }
                $('.close-event-modal').text(i18n.get('Close'));
            });
        });
    }
});