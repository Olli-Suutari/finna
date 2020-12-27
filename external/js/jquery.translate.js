/**
 * @file jquery.translate.js
 * @brief jQuery plugin to translate text in the client side.
 * @author Manuel Fernandes
 * @site
 * @version 0.9
 * @license MIT license <http://www.opensource.org/licenses/MIT>
 *
 * translate.js is a jQuery plugin to translate text in the client side.
 *
 */
var dict = {
  "Transit details": {
    fi: "Liikenneyhteydet",
    en: "Transit details",
  },
  "Instructions for transit": {
    fi: "Ohjeita liikenteeseen",
    en: "Instructions for transit",
  },
  "Route and transportation": {
    fi: "Reittiopas ja julkinen liikenne",
    en: "Route and public transportation",
  },
  "Navigation to location": {
    fi: "Reittiopas",
    en: "Navigation to location",
  },
  "Buses": {
    fi: "Linja-autot",
    en: "Buses",
  },
  "Closed": {
    fi: "Suljettu",
    en: "Closed",
  },
  "Toggle full-screen": {
    fi: "Avaa tai sulje kokoruututila.",
    en: "Toggle full-screen.",
  },
  "Address details": {
    fi: "Osoitetiedot",
    en: "Address details",
  },
  "Address": {
    fi: "Osoite",
    en: "Address",
  },
  "Location": {
    fi: "Sijainti",
    en: "Location",
  },
  "Price": {
    fi: "Hintatiedot",
    en: "Price",
  },
  "Website": {
    fi: "Lisätietoja verkossa",
    en: "Website",
  },
  "Additional details": {
    fi: "Lisätietoja",
    en: "Additional details",
  },
  "Close": {
    fi: "Sulje",
    en: "Close",
  },
  "Events": {
    fi: "Tapahtumat",
    en: "Events",
  },
  "More events": {
    fi: "Lisää tapahtumia",
    en: "More events",
  },
  "Starting": {
    fi: " alkaen",
    en: " >",
  },
  "Filter events": {
    fi: "Tapahtumien rajaus",
    en: "Filter events",
  },
  "Category": {
    fi: "Kategoria",
    en: "Category",
  },
  "Show or hide category filter": {
    fi: "Piilota/näytä kategoriat",
    en: "Hide/show categories",
  },
  "Event category": {
    fi: "Tapahtuman tyyppi",
    en: "Event category",
  },
  "Event location": {
    fi: "Tapahtumapaikka",
    en: "Event location",
  },
  "Show or hide location filter": {
    fi: "Piilota/näytä tapahtumapaikat",
    en: "Hide/show categories",
  },
  "event locations": {
    fi: "tapahtumapaikkaa",
    en: "event locations",
  },
  "Other location": {
    fi: "Muu tapahtumapaikka",
    en: "Other location",
  },
  "Web event": {
    fi: "Verkkotapahtuma",
    en: "Web event",
  },
  "Keski Libraries": {
    fi: "Keski-kirjastot",
    en: "Keski Libraries",
  },
  "Location information": {
    fi: "Lisätietoja tapahtumapaikasta",
    en: "Location information",
  },
  "Show all events": {
    fi: "Näytä kaikki tapahtumat",
    en: "Show all events",
  },
  "No matching events": {
    fi: "Valituilla hakuehdoilla ei löytynyt yhtään tapahtumaa.",
    en: "No matching events found.",
  },
  "Order": {
    fi: "Järjestys",
    en: "Order",
  },
  "Show": {
    fi: "Näytä",
    en: "Show",
  },
  "Read": {
    fi: "Lue",
    en: "Read",
  },
  "View": {
    fi: "Näkymä",
    en: "Display",
  },
  "Opens in new tab": {
    fi: "avautuu uudessa välilehdessä",
    en: "opens in a new tab",
  }
};

(function($){
  $.fn.translate = function(options) {

    var that = this; //a reference to ourselves

    var settings = {
      css: "trn",
      lang: "en"/*,
      t: {
        "translate": {
          pt: "tradução",
          br: "tradução"
        }
      }*/
    };
    settings = $.extend(settings, options || {});
    if (settings.css.lastIndexOf(".", 0) !== 0)   //doesn't start with '.'
      settings.css = "." + settings.css;
       
    var t = settings.t;
 
    //public methods
    this.lang = function(l) {
      if (l) {
        settings.lang = l;
        this.translate(settings);  //translate everything
      }
        
      return settings.lang;
    };


    this.get = function(index) {
      var res = index;

      try {
        res = t[index][settings.lang];
      }
      catch (err) {
        //not found, return index
        return index;
      }
      
      if (res)
        return res;
      else
        return index;
    };

    this.g = this.get;


    
    //main
    this.find(settings.css).each(function(i) {
      var $this = $(this);

      var trn_key = $this.attr("data-trn-key");
      if (!trn_key) {
        trn_key = $this.html();
        $this.attr("data-trn-key", trn_key);   //store key for next time
      }

      $this.html(that.get(trn_key));
    });
    
    
		return this;
		
		

  };
})(jQuery);

var dictLang = "fi";
if (document.documentElement.lang == "en-gb") {
  dictLang = "en";
}
i18n = $('body').translate({lang: dictLang, t: dict});
