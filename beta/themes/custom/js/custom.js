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
    if (locationUrl == "https://keski.finna-test.fi/beta/Search/Advanced") {
        $('.searchContent').css('display', 'none')
        return;
    }
    if (locationUrl.indexOf('/Search/History') > -1) {
        return;
    }
    // If user has a search historry, append the history button.
    try {
        $.get( 'https://keski.finna-test.fi/beta/Search/History', function( data ) {
            //console.log(data)
            if (data.indexOf('<h4>Hakuhistoria on tyhj') > -1 || 
            data.indexOf('There are currently no') > -1) {
                console.log("IS EMPTY SEARCH HISTORY!")
                return;
            }
            else {
                $('.history-btn').css('visibility', 'visible');
            }
          });
    }
    catch(e) {
        // Page not found... console.log(e)
        $('.history-btn').css('visibility', 'visible');
    }
}

function addSelectedNav() {
    if (locationUrl == 'https://keski.finna-test.fi/beta/') {
        $('.navbar-brand').addClass("selected-nav");
    }
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
    else {
        var linksInTipsMenu = [];
        $('#menu_Vinkit a').each(function(){
            //do something with the link element
            //console.log(this.href)
            if (locationUrl.indexOf(this.href) > -1) {
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
    loadJsOrCssFile("https://fonts.googleapis.com/css?family=Lato|Open+Sans&display=swap", "css");
    //loadJsOrCssFile("https://use.fontawesome.com/releases/v5.12.0/css/all.css", "css") 
    //loadJsOrCssFile("https://use.fontawesome.com/releases/v5.12.0/css/v4-shims.css", "css")
    //loadJsOrCssFile("https://use.fontawesome.com/releases/v5.12.0/js/all.js", "js")
    //loadJsOrCssFile("https://use.fontawesome.com/releases/v5.12.0/js/v4-shims.js", "js")

    locationUrl = window.location.href;
    if (locationUrl.indexOf('?lng=fi') > -1) {
        locationUrl = locationUrl.replace('?lng=fi', '');
    }
    else if(locationUrl.indexOf('?lng=en-gb') > -1) {
        locationUrl = locationUrl.replace('?lng=en-gb', '');
    }
    addSelectedNav();
    appendSearchBar();

    // Change English to "In English" and "Suomi" to "Suomeksi"
    /*
    if (document.documentElement.lang.toLowerCase() === "fi") {
        console.log("HEY HEY")
        $('.lang a[href$="=en-gb"]').text("In English")
    }
    else {
        $('.lang a[href$="=fi"]').text("Suomeksi")
    }
    */

}
