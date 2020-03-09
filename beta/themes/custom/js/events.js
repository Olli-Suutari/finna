$.ajax("https://keski-finna.fi/wp-json/acf/v3/events", {
    accepts:{
        xml:"application/json"
    },
    dataType:"json",
    success:function(data) {
        console.log(data);
        for (var i = 0; i < data.length; i++) {
            var event = data[i].acf;
            console.log(event);
        }
    },
    error: function (request, status, error) {
        console.log(error)
    },
    complete: function () {

    }
});
