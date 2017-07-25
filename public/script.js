var passcode_intent = function() {
    if ($(".authInput").val().length == 4) {
        $(".authInput").prop('disabled', true);
        var passcode = $(".authInput").val();
        $.post("", { id: Cookies.get("sessionKey"), type: "intent_auth", passcode: passcode },
        function(data, status){
            var obj = jQuery.parseJSON(data);
            console.log(obj.success)
            $(".authInput").val("");
            $(".authInput").prop('disabled', false);
        });

    }
};

var get_uid = function() {
    var oneTimeKey;
    $.post("", { type: "get_uid" },
        function(data, status){
            var obj = jQuery.parseJSON(data);
            oneTimeKey = obj.newID;
            Cookies.set("sessionKey", oneTimeKey);
        });
    
};

var main = function() {
    
    get_uid();

    $(".colourButton").click(function () {
        var colourRequest = $(this).attr('class').replace("colourButton ", "");
        $.post("", { id: Cookies.get("sessionKey"), type: "intent_colour", colour: colourRequest },
            function(data, status){
                var obj = jQuery.parseJSON(data);
                console.log("Server replied: " + obj.colour);
                if (obj.colour != "black") {
                    $("body").css("background-color", obj.colour);    
                }
                else {
                    $("body").css("background-color", "#fff");
                } 
            });
    });
};

$(document).ready(main);
