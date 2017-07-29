var create_colours = function() {
    var i = 0;
    var colours = ["red", "pink", "purple", "blue", "lblue", "cyan", "green", "yellow", "orange"];
    while (i < 9) {
        $(".colourContainer").append('<div class="colourOpt ' + colours[i] + '"></div>');
        i = i + 1;
    }
};

var update_colours = function(colour) {
    $('meta[name=theme-color]').remove();
    if (colour != "off") { 
        var newClassName = "titleBar " + colour;
        
        var $temp = $('<span class="' + colour + '"></span>"').hide().appendTo("body");
        var hexVal = $temp.css("background-color");
        $temp.remove();
        $('head').append('<meta name="theme-color" content="' + hexVal + '">');
    }
    else { 
        var newClassName = "titleBar"; 
        $('head').append('<meta name="theme-color" content="#2a2a2a">');
    }
    $(".titleBar").attr('class', newClassName);
};

var colour_intent = function() {
    $(".colourOpt").click(function () {
        var colourRequest = $(this).attr('class').replace("colourOpt ", "");
        $.post("", { id: Cookies.get("sessionKey"), type: "intent_colour", colour: colourRequest },
            function(data, status){
                var obj = jQuery.parseJSON(data);
                if (obj.success == "true") {
                    update_colours(obj.colour);
                }
            });
    });  
};

var power_intent = function() {
    $(".titleBar").click(function() {
        $.post("", { id: Cookies.get("sessionKey"), type: "intent_off"},
            function(data, status){
                var obj = jQuery.parseJSON(data);
                if (obj.success == "true") {
                    update_colours("off");
                }
            });
    })  
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
            }
            else {
                $(".lockTitle").addClass("animate_authBad");
                $(".lock").addClass("animate_authBad");
                $(".authInput").val("");
                $(".authInput").prop('disabled', false);
                $(".authInput").focus();
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
    /* Add html elements and bind event listeners */
    get_uid();
    create_colours();
    colour_intent();
    power_intent();
    
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
