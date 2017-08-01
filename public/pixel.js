var create_colours = function() {
    var i = 0;
    var colours = ["red", "pink", "purple", "blue", "lblue", "cyan", "green", "yellow", "orange"];
    while (i < 9) {
        $(".colourContainer").append('<div class="colourOpt ' + colours[i] + '"></div>');
        i = i + 1;
    }
};

var error_call = function(status) {
    var details = "Unfortunately an error has occurred. Please ";
    if (status == 1 || status == 2) {
        var errorTitle = "Error: Bad Auth";
        details += "refresh the page and login again.";
        var code = "CL0" + status;
    }
    
    $(".errorTitle").text(errorTitle);
    $(".errorDetails").text(details);
    $(".errorCode").text(code);
    $(".fullPageCover").fadeIn(400);
    $(".errorContainer").fadeIn(400);
}


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
        $.post("", { id: Cookies.get("userKey"), server_key: Cookies.get("serverKey"), type: "intent_colour", colour: colourRequest },
            function(data, status){
                var obj = jQuery.parseJSON(data);
                console.log(obj.success);
                if (obj.success == 1) {
                    update_colours(obj.colour);
                } else {
                    error_call(1);
                }
            });
    });  
};

var power_intent = function() {
    $(".titleBar").click(function() {
        $.post("", { id: Cookies.get("userKey"), server_key: Cookies.get("serverKey"), type: "intent_off"},
            function(data, status){
                var obj = jQuery.parseJSON(data);
                if (obj.success == 1) {
                    update_colours("off");
                } else {
                    error_call(2);
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
        $.post("", { id: Cookies.get("userKey"), type: "intent_auth", passcode: passcode },
        function(data, status){
            var obj = jQuery.parseJSON(data);
            console.log(obj.success);
            if(obj.success == "true") {
                $(".lockScreen").slideUp();
                $(".content").delay(400).fadeIn();
                Cookies.set("serverKey", obj.session);
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
            Cookies.set("userKey", oneTimeKey);
        });
};

var main = function() {
    /* Add html elements and bind event listeners */
    get_uid();
    create_colours();
    colour_intent();
    power_intent();
    
//    $(".colourContainer").click(function () {
//        $(".fullPageCover").fadeToggle(400);
//        $(".detailedColours").fadeToggle(400);
//    });
//    $(".fullPageCover").click(function () {
//        $(".detailedColours").fadeToggle(400);
//        $(".fullPageCover").fadeToggle(400); 
//    });
};

$(document).ready(main);
