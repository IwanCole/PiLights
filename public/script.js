var create_colours = function() {
    var i = 0;
    var colours = ["red", "pink", "purple", "blue", "lblue", "cyan", "green", "yellow", "orange"];
    while (i < 9) {
        $(".colourContainer").append('<div class="colourOpt ' + colours[i] + '"><span></span></div>');
        i = i + 1;
    }
};

var passcode_intent = function() {
    if ($(".authInput").val().length == 4) {
        $(".lockTitle").removeClass("animate_authBad");
        $(".lock").removeClass("animate_authBad");
        $(".authInput").prop('disabled', true);
        var passcode = $(".authInput").val();
        $.post("", { id: Cookies.get("sessionKey"), type: "intent_auth", passcode: passcode },
        function(data, status){
            var obj = jQuery.parseJSON(data);
            console.log(obj.success);
            if(obj.success == "true") {
                $(".lockScreen").slideUp();
                $(".content").delay(400).fadeIn();
//                $('meta[name=theme-color]').remove();
//                $('head').append('<meta name="theme-color" content="#EEEEEE">');
            }
            else {
                $(".lockTitle").addClass("animate_authBad");
                $(".lock").addClass("animate_authBad");
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
    create_colours();
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
