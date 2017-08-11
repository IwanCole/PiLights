var colours = ["red", "pink", "purple", "blue", "lblue", "cyan", "green", "yellow", "orange"];

var create_colours = function() {
    var i = 0;
    while (i < 9) {
        $(".colourContainer").append('<div class="colourOpt ' + colours[i] + '"></div>');
        i = i + 1;
    }
};

var error_call = function(status) {
    var details = "Unfortunately an error has occurred. Please ";
    if (status == 1 || status == 2 || status == 3) {
        var errorTitle = "Error: Bad Auth";
        details += "refresh the page and login again.";
        var code = "CL0" + status;
    }

    $(".errorTitle").text(errorTitle);
    $(".errorDetails").text(details);
    $(".errorCode").text(code);
    $(".errorCover").fadeIn(400);
    $(".errorContainer").fadeIn(400);
}

var effects_intent = function() {
   $(".effectCard").click(function () {
        // var effect = $(this).children()[0].attr('class').replace("effectImg img", "");
        var effect = $(this).children()[0]['className'].replace("effectImg img", "").toLowerCase();
        // console.log($(this).children()[0]);
        // alert(effect);
        $.post("", { id: Cookies.get("userKey"), server_key: Cookies.get("serverKey"), type: "intent_effect", effect_type: effect },
            function(data, status){
                var obj = jQuery.parseJSON(data);
                console.log(obj.success);
                if (obj.success == 1) {
                    // update_colours(obj.colour);
                    console.log("Do something when successful on effects");
                } else {
                    error_call(3);
                }
            });
   })
};

var detailed_intent = function() {
    $(".detColourOpt").click(function () {
        var colourRequest = $(this).attr('class').replace("detColourOpt ", "");
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
        $(".detailedCover").fadeOut(200);
        $(".detailedColours").fadeOut(200);
    });
};

var detailed_colours = function() {
    $('.colourOpt').on('press', function(e) {
            $(".detailedColours").empty();
            // Don't hate me (:
            var detColours = ["or3", "or4", "rp1", "rp2", "rp3", "rp4", "pp1", "pp2", "pp3", "pp4", "pb1", "pb2", "pb3", "pb4", "bl1", "bl2", "bl3", "bl4", "lc1", "lc2", "lc3", "lc4", "cg1", "cg2", "cg3", "cg4", "gy1", "gy2", "gy3", "gy4", "yo1", "yo2", "yo3", "yo4", "or1", "or2"];
            var selection = $(this).attr('class').replace("colourOpt ","");
            var startIndex = (jQuery.inArray(selection, colours)) * 4;
            var i = 0;
            while (i < 4) {
                $(".detailedColours").append('<div class="detColourOpt ' + detColours[startIndex + i] + '"></div>');
                if (i == 1) {
                    $(".detailedColours").append('<div class="detColourOpt ' + selection + '"></div>');
                }
                i = i + 1;
            }
            detailed_intent();
            $(".detailedCover").fadeIn(200);
            $(".detailedColours").fadeIn(200);
        });

    $(".detailedCover").click(function() {
        $(".detailedCover").fadeOut(200);
        $(".detailedColours").fadeOut(200);
    });

};

var update_colours = function(colour) {
    $('meta[name=theme-color]').remove();
    if (colour != "off") {
        var newClassName = "titleBar noTouch " + colour;

        var $temp = $('<span class="' + colour + '"></span>"').hide().appendTo("body");
        var hexVal = $temp.css("background-color");
        $temp.remove();
        $('head').append('<meta name="theme-color" content="' + hexVal + '">');
    }
    else {
        var newClassName = "titleBar noTouch";
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
    $(".power").click(function() {
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

var navigation = function() {
    $(".sectionCard").click(function() {
        var section = $(this).attr('class').replace("sectionCard ","").replace(" noTouch", "");
        $(".splash").fadeOut();
        if (section == "simpleSection") { $(".plainColours").delay(400).fadeIn() }
        else if (section == "effectsSection") { $(".effectsColours").delay(400).fadeIn() }
        else if (section == "settingSection") { $(".settings").delay(400).fadeIn() }
        $(".back").fadeIn(200);
    });

    $(".back").click(function() {
        $(".plainColours").fadeOut(400);
        $(".effectsColours").fadeOut(400);
        $(".settings").fadeOut(400);
        $(".splash").delay(400).fadeIn(400);
        $(".back").fadeOut(200);
    });
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
    navigation();
    create_colours();
    effects_intent();
    detailed_colours();
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
