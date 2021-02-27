function loadJsOrCssFile(filename, filetype){
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

function finnaCustomInit() {
    // Load the script from keski-finna.fi portal.
    // If on test version, load expiremental scripts, otherwise use the bundled version.
    if (window.location.href.indexOf('a-pre.fi') > -1) {
        console.log("Load test...");
        loadJsOrCssFile("https://keski-finna.fi/external/finna/js/main.js", "js");
        //loadJsOrCssFile("https://keski-finna.fi/external/finna/js/dist/main.js", "js");
        return
    }
    loadJsOrCssFile("https://keski-finna.fi/external/finna/js/dist/main.js", "js");
}
