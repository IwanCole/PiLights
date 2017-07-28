var passcode_intent = function() {
    if ($(".authInput").val().length == 4) {
        $(".authInput").prop('disabled', true);
        var passcode = $(".authInput").val();
        $.post("", { id: Cookies.get("sessionKey"), type: "intent_auth", passcode: passcode },
        function(data, status){
            var obj = jQuery.parseJSON(data);
            console.log(obj.success);
            if(obj.success == "true") {
                $(".lockScreen").slideUp();
                $(".content").delay(400).fadeIn();
            }
            else {
               $(".authInput").val("");
                $(".authInput").prop('disabled', false); 
            }            
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
    
    $(".colourContainer").click(function () {
        $(".fullPageCover").fadeToggle(400);
        $(".detailedColours").fadeToggle(400);
    });
    $(".fullPageCover").click(function () {
        $(".detailedColours").fadeToggle(400);
        $(".fullPageCover").fadeToggle(400); 
    });
    
};

$(document).ready(main);
