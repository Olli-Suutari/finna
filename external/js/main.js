function importJsOrCssFile(filename, filetype){
    if (filetype=="js") { //if filename is a external JavaScript file
        var fileref=document.createElement('script');
        fileref.setAttribute("type","text/javascript");
        fileref.setAttribute("src", filename);
    }
    else if (filetype=="css") { //if filename is an external CSS file
        var fileref=document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", filename);
    }
    if (typeof fileref!="undefined")
        document.getElementsByTagName("head")[0].appendChild(fileref)
}


/* Add your custom template javascript here */
var locationUrl = "";

function importJsOrCssFile(filename, filetype){
    if (filetype=="js") { //if filename is a external JavaScript file
        var fileref=document.createElement('script');
        fileref.setAttribute("type","text/javascript");
        fileref.setAttribute("src", filename);
    }
    else if (filetype=="css") { //if filename is an external CSS file
        var fileref=document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", filename);
    }
    if (typeof fileref!="undefined")
        document.getElementsByTagName("head")[0].appendChild(fileref)
}

// Function for checking if page exists and redirecting accordingly.
function checkUrlForContent(url) {
    try {
        $.get( url, function() {
            window.location = url;
        });
    }
    catch(e) {
        // Page not found... console.log(e)
    }
}

function appendSearchBar () {
    if (locationUrl.indexOf('/Search/Advanced') > -1 ||
        $('.adv_search_links').length) {
        // If we use display none or remove the whole search bar, advanced search help tooltip won't work.
        $('section[role=search] .search-form-container').removeClass('search-form-container');
        $('section[role=search]').css('visibility', 'hidden');
        $('section[role=search]').removeClass('searchContent');
        $('section[role=search]').removeAttr('role');
        return;
    }
    if (locationUrl.toLowerCase().indexOf ('/content/help') > -1) {
        $('#searchHelpLink').parent().css('display', 'none')
    }
    if (locationUrl.indexOf('/Search/History') > -1) {
        $('.history-btn').parent().css('display', 'none');
        return;
    }
}

function addSelectedNav() {
    if (locationUrl.indexOf('/Content/kirjastot') > -1) {
        $('header li a[href$="/kirjastot"]').addClass("selected-nav");
    }
    else if (locationUrl.indexOf('/Content/info') > -1) {
        $('header li a[href$="/info"]').addClass("selected-nav");
    }
    else if (locationUrl.indexOf('/Content/ekirjasto') > -1) {
        $('header li a[href$="/ekirjasto"]').addClass("selected-nav");
    }
    else if (locationUrl.indexOf('/Feedback/Home') > -1) {
        $('header li a[href$="/Feedback/Home"]').addClass("selected-nav");
    }
    else if (locationUrl.indexOf('/Content/terms') > -1) {
        $('footer li a[href$="/Content/terms"]').parent().addClass("selected-nav");
    }
    else if (locationUrl.indexOf('/Content/privacy') > -1) {
        $('footer li a[href$="/Content/privacy"]').parent().addClass("selected-nav");
    }
    else if (locationUrl.indexOf('/Content/accessibility-statement') > -1) {
        $('footer li a[href$="/Content/accessibility-statement"]').parent().addClass("selected-nav");
    }
    else {
        var linksInTipsMenu = [];
        $('#menu_Vinkit a').each(function(){
            //do something with the link element
            if (locationUrl.indexOf(this.href) > -1) {
                $('#menu_Vinkit').addClass("selected-nav");
                $('#menu_Vinkit').addClass("selected-nav");
                var linkEnding = this.href.substring(this.href.lastIndexOf("/") + 1);
                $('li a[href$="' + linkEnding + '"]').addClass("selected-nav");
            }
        });
    }
}

function leftNavigationScrollDisplay() {
    if ($('.content-navigation-menu').length) {
        $(".content-navigation-menu h2 a").first().parent().addClass('selected-sub-nav');
        var navSections = [];
        $(".content-navigation-menu h2 a").each(function(){
            var selector = $(this.hash).selector;
            if(selector !== undefined) {
                selector = selector.substr(1);
                navSections.push(selector);
            }
        });
        var navSectitionsWithPos = [];
        for (i = 0; i < navSections.length; i++) {
            var position = window.scrollY + document.getElementById(navSections[i]).getBoundingClientRect().top
            navSectitionsWithPos.push( { 'id': navSections[i], 'pos':  position } );
        }

        var navSectitionsWithPosEnd = [];
        for (i = 0; i < navSectitionsWithPos.length; i++) {
            var positionEnd = 99999999;
            if (i < navSectitionsWithPos.length -1) {
                positionEnd = navSectitionsWithPos[i + 1].pos;
            }
            // Add end pos + adjusted -+ 80px to accommodate margins.
            navSectitionsWithPosEnd.push( { 'id': navSectitionsWithPos[i].id,
                'pos':  navSectitionsWithPos[i].pos -80, 'posEnd': positionEnd + 80 } );
        }

        // Reference: http://www.html5rocks.com/en/tutorials/speed/animations/
        let last_known_scroll_position = 0;
        let ticking = false;
        function doSomething(scroll_pos) {
            // Do something with the scroll position
            for (i = 0; i < navSectitionsWithPosEnd.length; i++) {
                if (scroll_pos >= navSectitionsWithPosEnd[i].pos &&
                    scroll_pos <= navSectitionsWithPosEnd[i].posEnd) {
                    $('.selected-sub-nav').removeClass('selected-sub-nav');
                    var newSelected = $('h2 a[href$="#' + navSectitionsWithPosEnd[i].id + '"');
                    newSelected.parent().addClass('selected-sub-nav');
                }
            }
        }
        // Add/remove selected nav element class based on scroll pos.
        window.addEventListener('scroll', function(e) {
            last_known_scroll_position = window.scrollY;
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    doSomething(last_known_scroll_position);
                    ticking = false;
                });

                ticking = true;
            }
        });

    }
}

// Function for displaying last page number if more than 5 pages remain and hiding prev/next navigations if on 2nd last/first pages.
function smartPaginationDisplay() {

    var totalResults = $('.pagination-text .total').text();
    if (totalResults != "") {
        console.log(totalResults)
        //$('.sort-option-container').prepend('<span class="total-count">' + totalResults + ' hakutulosta</span>');
    }

    // Remove "Näytetään"
    $( ".pagination-text span" ).each(function( index ) {
        var value = $( this ).text();
        if (value == "Näytetään ") {
            $( this ).css('display', 'none');
        }
    });

    // Remove space in 41-60.
    $( ".pagination-text strong" ).each(function( index ) {
        var value = $( this ).text();
        value = value.replace(/ /g, "");
        $( this ).text(value);

    });

    $('.sort-option-container .sort-button span').prepend('<span class="sort-by">Järjestys:</span>');
    $('.limit-option-container .sort-button span').prepend('<span class="results-on-page">Tuloksia sivulla:</span>');



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
    if ( document.documentElement.lang.toLowerCase() === "fi" ) {
        if ($('.filter-text:contains("Keski-kirjastot")')) {
            // Unless we apply the contains filter, other filter texts will also be replaced.
            $( ".filter-text" ).each(function( index ) {
                var newValue = $( this ).text();
                newValue = newValue.replace('Keski-kirjastot > ', '');
                $( this ).text(newValue);
            });
        }
    }
    else {
        if ($('.filter-text:contains("Keski Libraries")')) {
            $( ".filter-text" ).each(function( index ) {
                var newValue = $( this ).text();
                newValue = newValue.replace('Keski Libraries > ', '');
                $( this ).text(newValue);
            });
        }
    }
    // "Verkossa saatavilla" does not have .title-value-pair, and thus no styling.
    $( ".filter-value" ).each(function( index ) {
        if (!$(this).hasClass('filters-and') && !$(this).hasClass('filters-or')) {
            !$(this).addClass('title-value-pair');
            !$(this).removeClass('filter-value');
        }
    });
    // Hide "Verkossa saatavilla" if none are available.
    var webCount = $('div [data-facet="online_boolean:1"] .avail-count').text();
    if (webCount == 0) {
        $('div [data-facet="online_boolean:1"]').parent().parent().css('display', 'none');
    }
    // Hide subtitle language if none are available.
    var toggleSubLang = $('#side-panel-subtitle_lng_str_mv .collapsed');
    $(toggleSubLang).click();
    setTimeout(function(){
        var subLang = $('#side-collapse-subtitle_lng_str_mv .list-group-item').text();
        if (subLang == "Ei tietoja" || subLang == "No data available") {
            $('#side-collapse-subtitle_lng_str_mv').parent().css('display', 'none');
        }
        else {
            $('#side-panel-subtitle_lng_str_mv button').click();

        }
    }, 800);



}

function homeLibFunctionality() {
    var container = document.getElementById('libFrame');
    // Add transition style for smooth height adjustments.
    var css = document.createElement("style");
    css.type = "text/css";
    css.innerHTML = '#libFrame { transition: height 500ms; margin-top: 2em; }';
    document.head.appendChild(css);
    // Event listener for messages from the iframe.
    window.addEventListener('message', function(event) {
        var data = event.data;
        // Resize the window.
        if(data.type === "resize") {
            var height = data.value;
            // Check if smaller than keskikirjastot slider.
            var carouselHeight = $( ".newsCarousel-container" ).height();
            // Minimum height of 320.
            if(height < 320) {
                height = 320;
            }
            else if($(window).width() > 767 && height < carouselHeight) {
                // Carousel height of keskikirjastot homepage.
                var iframeHeight = $( "#libFrame" ).height();
                if(iframeHeight < carouselHeight) {
                    height = carouselHeight;
                }
            }
            container.style.height = (height) + "px";
        }
        // Redirect to libraries page.
        else if(data.type === "redirect") {
            try {
                window.location.href = data.value;
            }
            catch (e) {
                console.log("Redirect failed: " + e);
            }
        }
    });
}

locationUrl = window.location.href;
console.log("locationurl: " + window.location.href);
// Old /beta/
if (locationUrl.indexOf('/beta/') > -1) {
    window.location = locationUrl.replace('/beta/', '/');
}
console.log("CHECK FOR CONTENT")
// /Content/ should not be case sensitive...
if (locationUrl.indexOf('/content/') > -1) {
    window.location = locationUrl.replace('/content/', '/Content/');
}
if (locationUrl.indexOf('?lng=fi') > -1) {
    locationUrl = locationUrl.replace('?lng=fi', '');
}
else if(locationUrl.indexOf('?lng=en-gb') > -1) {
    locationUrl = locationUrl.replace('?lng=en-gb', '');
}

// Load the news and fonts.
//importJsOrCssFile("/keski/themes/custom/js/news.js", "js");
//importJsOrCssFile("/keski/themes/custom/js/events.js", "js");


importJsOrCssFile("https://fonts.googleapis.com/css?family=Lato|Open+Sans&display=swap", "css");
//importJsOrCssFile("https://use.fontawesome.com/releases/v5.12.0/css/all.css", "css")
//importJsOrCssFile("https://use.fontawesome.com/releases/v5.12.0/css/v4-shims.css", "css")
//importJsOrCssFile("https://use.fontawesome.com/releases/v5.12.0/js/all.js", "js")
//importJsOrCssFile("https://use.fontawesome.com/releases/v5.12.0/js/v4-shims.js", "js")

if (!window.moment) {
    console.log("Load moment.")
    importJsOrCssFile("/keski/themes/custom/js/lib/moment.min.js", "js");
}

if (!window.tileLayer) {
    console.log("Load Leaflet tile fallback.")
    importJsOrCssFile("https://keski-finna.fi/external/finna/js/lib/leafletTileFallback.min.js", "js");

}

if (!window.i18n) {
    //importJsOrCssFile('https://keski-finna.fi/external/finna/style/events.css', "css");

    require("https://keski-finna.fi/external/finna/js/jquery.translate.js", loadTranslations());
    //require("https://keski-finna.fi/external/finna/js/lib/jquery.translate.js", loadTranslations());


}


function loadTranslations() {
    importJsOrCssFile('https://keski-finna.fi/external/finna/js/events.js', "js");

}

function loadEvents() {
    console.log("LOAD EV")


}



var isIOS = false;
// https://stackoverflow.com/questions/7944460/detect-safari-browser
var testSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
    navigator.userAgent &&
    navigator.userAgent.indexOf('CriOS') == -1 &&
    navigator.userAgent.indexOf('FxiOS') == -1;
if (testSafari || /^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
    isIOS = true;
}
// https://stackoverflow.com/questions/4617638/detect-ipad-users-using-jquery
var isIPad = navigator.userAgent.match(/iPad/i) != null;
var isIPhone = (navigator.userAgent.match(/iPhone/i) != null) || (navigator.userAgent.match(/iPod/i) != null);
if (isIPad || isIPhone) {
    isIOS = true;
}

// This file is used to dynamically generate styles for library & homePage pages.
// https://stackoverflow.com/questions/3922139/add-css-to-head-with-javascript
function addCssToDocument(css){
    var head = document.getElementsByTagName('head')[0];
    var s = document.createElement('style');
    s.setAttribute('type', 'text/css');
    if (s.styleSheet) {   // IE
        s.styleSheet.cssText = css;
    } else {                // the world
        s.appendChild(document.createTextNode(css));
    }
    head.appendChild(s);
}

function require(url, callback) {
    var e = document.createElement("script");
    e.src = url;
    e.type="text/javascript";
    e.addEventListener('load', callback);
    document.getElementsByTagName("head")[0].appendChild(e);
}

function main() {
    addSelectedNav();
    appendSearchBar();
    leftNavigationScrollDisplay();

    if ($('.keski-news-home').length === 1) {
        homeLibFunctionality();
    }


    if (locationUrl.indexOf('/Search/Results') > -1) {
        window.onload = function() {
            smartPaginationDisplay();
        };
        $('#browseLi').css('display', 'none');
    }

    $('.autocomplete-results').addClass('hidden-search-autocomplete');

// ios renders the margin above the login differently. :)
    if (isIOS) {
        $('.login-btn').addClass('ios-login');
    }
}

main();

// TO DO: Load polyfills for IE.
/*
if (navigator.userAgent.indexOf('MSIE ') > -1 || navigator.userAgent.indexOf('Trident/') > -1) {
    require("https://keski-finna.fi/external/finna/js/lib/less.min.js", function() {
        main();
    });
}
else {
    main();
}
*/

importJsOrCssFile('https://keski-finna.fi/external/finna/js/news.js', "js");
