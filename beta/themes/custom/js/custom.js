/* Add your custom template javascript here */

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


    if(window.location.href == "https://keski.finna-test.fi/beta/") {
        $('.searchbox-home').removeClass('searchbox-home');
        $('.search-links').css("display", "none");
        $('.search').append('<a href="/beta/Search/Advanced" class="btn btn-link btn-advanced"><i class="fa fa-search-adv"></i>Tarkennettu haku</a>')
    }
    else {
        $('.search').append('<a href="/beta/Search/Advanced" class="btn btn-link btn-advanced"><i class="fa fa-search-adv"></i>Tarkennettu haku</a>')
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
          });
    }
    catch(e) {
        // Page not found... console.log(e)
    }
    $('.search').append('<a href="/beta/Search/History" class="btn btn-link btn-advanced"><i class="fa fa-history"></i>Hakuhistoria</a>')
}


function loadjscssfile(filename, filetype){
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


function finnaCustomInit() {
    loadjscssfile("https://fonts.googleapis.com/css?family=Lobster|Raleway", "css") ////dynamically load and add this .css file

    loadjscssfile("https://fonts.googleapis.com/css?family=Ibarra+Real+Nova|Open+Sans&display=swap", "css") 

    var locationUrl = window.location.href;
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
    appendSearchBar();
}
