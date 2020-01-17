/* Add your custom template javascript here */
var locationUrl = "";


function loadJsOrCssFile(filename, filetype){
    if (filetype=="js"){ //if filename is a external JavaScript file
        var fileref=document.createElement('script')
        fileref.setAttribute("type","text/javascript")
        fileref.setAttribute("src", filename)
    }
    else if (filetype=="css"){ //if filename is an external CSS file
        var fileref=document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
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

    if (window.location.href == "https://keski.finna-test.fi/beta/Search/Advanced") {
        $('.searchContent').css('display', 'none')
        return;
    }

    if(window.location.href == "https://keski.finna-test.fi/beta/") {
        $('.searchbox-home').removeClass('searchbox-home');
        $('.search-links').css("display", "none");
        $('.search').append('<a href="/beta/Search/Advanced" class="btn btn-link btn-advanced"><i class="fa fa-search-adv"></i> Tarkennettu haku</a>')
        $('.search').append('<a href="/beta/Content/Help" class="btn btn-link btn-advanced"><i class="fa fa-info-circle"></i> Hakuohjeet</a>')
    }
    else {
        $('.search').append('<a href="/beta/Search/Advanced" class="btn btn-link btn-advanced"><i class="fa fa-search-adv"></i> Tarkennettu haku</a>')
        $('.search').append('<a href="/beta/Content/Help" class="btn btn-link btn-advanced"><i class="fa fa-info-circle"></i> Hakuohjeet</a>')
    }

    if (window.location.href.indexOf('/Search/History') > -1) {
        return;
    }
    try {
        $.get( 'https://keski.finna-test.fi/beta/Search/History', function( data ) {
            //console.log(data)
            if (data.indexOf('<h4>Hakuhistoria on tyhj') > -1) {
                console.log("IS EMPTY SEARCH HISTORY!")
                return;
            }
            else {
                $('.search').append('<a href="/beta/Search/History" class="btn btn-link btn-advanced"><i class="fa fa-history"></i>Hakuhistoria</a>')
            }
          });
    }
    catch(e) {
        // Page not found... console.log(e)
        $('.search').append('<a href="/beta/Search/History" class="btn btn-link btn-advanced"><i class="fa fa-history"></i>Hakuhistoria</a>')
    }

}

function addIconsToMainNavigation() {
    $('header a[href$="/kirjastot"]').prepend('<i class="fa fa-building"></i> ')
    $('header a[href$="/info"]').prepend('<i class="fa fa-question-circle"></i> ')
    $('header a[href$="/ekirjasto"]').prepend('<i class="fa fa-globe"></i> ')
    $('header .fa-nav-menu_Vinkit').append('<i class="fa fa-archive"></i> ')
    $('header li a[href$="/Feedback/Home"]').prepend('<i class="fa fa-comment"></i> ')
    //$('a[href$="/kirjastot"]').prepend('<i class="fa fa-history"></i> ')
    if (window.location.href == 'https://keski.finna-test.fi/beta/') {
        $('.navbar-brand').addClass("selected-nav");
    }
    if (window.location.href.indexOf('/Content/kirjastot') > -1) {
        $('header li a[href$="/kirjastot"]').addClass("selected-nav");
    }
    else if (window.location.href.indexOf('/Content/info') > -1) {
        $('header li a[href$="/info"]').addClass("selected-nav");
    }
    else if (window.location.href.indexOf('/Content/ekirjasto') > -1) {
        $('header li a[href$="/ekirjasto"]').addClass("selected-nav");
    }
    else if (window.location.href.indexOf('/Feedback/Home') > -1) {
        $('header li a[href$="/Feedback/Home"]').addClass("selected-nav");
    }
    else {
        var linksInTipsMenu = [];
        $('#menu_Vinkit a').each(function(){
            //do something with the link element
            //console.log(this.href)
            if (window.location.href.indexOf(this.href) > -1) {
                $('#menu_Vinkit').addClass("selected-nav");
                $('#menu_Vinkit').addClass("selected-nav");
                var linkEnding = this.href.substring(this.href.lastIndexOf("/") + 1);
                console.log(linkEnding)

                $('li a[href$="' + linkEnding + '"]').addClass("selected-nav");

            }
         });
    }
}

function finnaCustomInit() {

    loadJsOrCssFile("https://fonts.googleapis.com/css?family=Lato|Open+Sans&display=swap", "css") 

    //loadJsOrCssFile("https://use.fontawesome.com/releases/v5.12.0/css/all.css", "css") 
    //loadJsOrCssFile("https://use.fontawesome.com/releases/v5.12.0/css/v4-shims.css", "css")
    //loadJsOrCssFile("https://use.fontawesome.com/releases/v5.12.0/js/all.js", "js")
    //loadJsOrCssFile("https://use.fontawesome.com/releases/v5.12.0/js/v4-shims.js", "js")

    locationUrl = window.location.href;
    // Re-direct to /Content/Foo if using lowercase /content/
    if (locationUrl.indexOf('/content/') > -1) {
        window.location = locationUrl.replace('/content/', '/Content/');
    }
    // Check for 404 page.
    if ($('.content-404').length > 0) {
        /* Remove duplicated //
        https://stackoverflow.com/questions/24381480/remove-duplicate-forward-slashes-from-the-url */
        if (locationUrl.indexOf('//') > -1) {
            if (locationUrl !== locationUrl.replace(/([^:]\/)\/+/g, '$1')) {
                window.location = locationUrl.replace(/([^:]\/)\/+/g, '$1');
            }
        }
        // Check if /Content/ page for the url exists.
        checkUrlForContent(locationUrl.substring(0, locationUrl.lastIndexOf('/')) + 
        '/Content' + locationUrl.substring(locationUrl.lastIndexOf('/')))
    }
    addIconsToMainNavigation();
    appendSearchBar();

}
