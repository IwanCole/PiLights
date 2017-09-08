var colours = ["red", "pink", "purple", "blue", "lblue", "cyan", "green", "yellow", "orange"];
// Don't hate me (:
var detColours = ["or3", "or4", "rp1", "rp2", "rp3", "rp4", "pp1", "pp2", "pp3", "pp4", "pb1", "pb2", "pb3", "pb4", "bl1", "bl2", "bl3", "bl4", "lc1", "lc2", "lc3", "lc4", "cg1", "cg2", "cg3", "cg4", "gy1", "gy2", "gy3", "gy4", "yo1", "yo2", "yo3", "yo4", "or1", "or2"];

var create_colours = function() {
    var i = 0;
    while (i < 9) {
        $(".colourContainer").append('<div class="colourOpt ' + colours[i] + '"></div>');
        i = i + 1;
    }

    var j = 0, k = 0;
    while (j < 36) {
        $(".allColours").append('<div class="allColourOpt ' + detColours[j] + '"></div>');
        if ((j % 4) == 1) {
            $(".allColours").append('<div class="allColourOpt ' + colours[k] + '"></div>');
            k += 1;
        }
        j += 1;
    }
};

// var create_effects = function() {
//     effectTitles = ["Fire", "Multi", "Water", "Forest"];
//
// };

var error_call = function(status) {
    var details = "Unfortunately an error has occurred. Please ";
    if (status == 1 || status == 2 || status == 3 || status == 4 || status == 5) {
        var errorTitle = "Error: Bad Auth";
        details += "refresh the page and login again.";
        var code = "CL0" + status;
    } else if (status == 6) {
        var errorTitle = "Error: Bad Response";
        details += " try again, check the logs, or restart the server.";
        var code = "SV0" + status;
    } else if (status == 7) {
        var errorTitle = "Error: Server Down"
        details += " check the Raspberry Pi is online, or SSH in to see if NodeJS has crashed.";
        var code = "SV0" + status;
    }
    $(".errorTitle").text(errorTitle);
    $(".errorDetails").text(details);
    $(".errorCode").text(code);
    $(".errorCover").fadeIn(400);
    $(".errorContainer").fadeIn(400);
};

var effect_reset = function() {
    $(".effectPreview").slideUp();
    $(".effectCover").fadeOut();
};

var effect_active = function(newEffect) {
    update_colours(newEffect, 2);
    $(".ring_" + newEffect).addClass("ringActive");
};

var effect_intent = function(effectSelected) {
    var effect = effectSelected.toLowerCase();
    $(".effectFAB").off("click"); // Unbind previous listener
    $(".effectFAB").click(function () {
        $.post("", { id: Cookies.get("userKey"), server_key: Cookies.get("serverKey"), type: "intent_effect", effect_type: effect },
            function(data, status){
                var obj = jQuery.parseJSON(data);
                if (obj.success == 1) { effect_active(effect) }
                else { error_call(3) }
            }).fail(function () { error_call(7) });
        effect_reset();
   });
};

var effect_peek = function() {
    $(".effectRing").click(function() {
        var effect = $(this).children()[0]['innerHTML'];
        $(".effectCard > .sectionTitle").text(effect);
        var newImage = "url('media/" + effect.toLowerCase() + ".jpg')"
        $(".effectPreview").css("background-image", newImage);
        $(".effectPreview").slideDown();
        $(".effectCover").fadeIn();
        effect_intent(effect);
    });
    $(".effectCover").click(function() {
        effect_reset();
    });
};

var colour_reset = function() {
    $(".colourContainer").fadeTo(200, 1);
    $(".detailedCover").fadeOut(200);
    $(".detailedColours").fadeOut(200);
};

var detailed_intent = function() {
    $(".detColourOpt").click(function () {
        var colourRequest = $(this).attr('class').replace("detColourOpt ", "");
        $.post("", { id: Cookies.get("userKey"), server_key: Cookies.get("serverKey"), type: "intent_colour", colour: colourRequest },
            function(data, status){
                var obj = jQuery.parseJSON(data);
                console.log(obj.success);
                if (obj.success == 1) { update_colours(obj.colour, 1) }
                else { error_call(1) }
            }).fail(function () { error_call(7) });
        colour_reset();
    });
    $(".detBlank").click(function() {
        colour_reset();
    });
};

var detailed_colours = function() {
    $('.colourOpt').on('press', function(e) {
        $(".detailedColours").css("top",($(".colourContainer").offset().top));
        $(".detailedColours").empty();
        var selection = $(this).attr('class').replace("colourOpt ","");
        var startIndex = (jQuery.inArray(selection, colours)) * 4;
        var i = 0;
        while (i < 4) {
            var element = '<div class="detColourOpt ' + detColours[startIndex + i] + '"></div>';
            var blank = '<div class="detBlank"></div>';
            if ((i == 0) || (i == 3)) { element = blank + element + blank }
            $(".detailedColours").append(element);
            if (i == 1) { $(".detailedColours").append('<div class="detColourOpt ' + selection + '"></div>') }
            i += 1;
        }
        detailed_intent();
        $(".colourContainer").fadeTo(200, 0);
        $(".detailedCover").fadeIn(200);
        $(".detailedColours").fadeIn(200);
    });
    $(".detailedCover").click(function() {
        colour_reset();
    });
};

// Function made by Erick Petrucelli on stackoverflow :)
var parse_rgb = function(rgb) {
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    function hex(x) { return ("0" + parseInt(x).toString(16)).slice(-2) }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
};

var white_or_black = function(colour) {
    var r = parseInt(colour.substring(1,3), 16);
    var g = parseInt(colour.substring(3,5), 16);
    var b = parseInt(colour.substring(5,7), 16);
    if ((r*0.299 + g*0.587 + b*0.114) > 186) { return "#000000" }
    else { return "#ffffff" }
};

var update_colours = function(colour, type) {
    $(".ringActive").removeClass("ringActive");
    if (colour != "off") {
        if (type == 2) { colour = "lightBar_" + colour }
        var newClassName = "lightBar " + colour;
    }
    else { var newClassName = "lightBar" }
    $(".lightBar").attr('class', newClassName);
};

var colour_intent = function(colourRequest) {
    $.post("", { id: Cookies.get("userKey"), server_key: Cookies.get("serverKey"), type: "intent_colour", colour: colourRequest },
        function(data, status){
            var obj = jQuery.parseJSON(data);
            console.log(obj.success);
            if (obj.success == 1) { update_colours(obj.colour, 1) }
            else { error_call(1) }
        }).fail(function () { error_call(7) });
};

var colour_intent_binder = function() {
    $(".colourOpt").click(function () {
        var colourRequest = $(this).attr('class').replace("colourOpt ", "");
        colour_intent(colourRequest);
    });
    $(".allColourOpt").click(function () {
        var colourRequest = $(this).attr('class').replace("allColourOpt ", "");
        colour_intent(colourRequest);
    });
};

var power_intent = function() {
    $(".power").click(function() {
        $.post("", { id: Cookies.get("userKey"), server_key: Cookies.get("serverKey"), type: "intent_off"},
            function(data, status){
                var obj = jQuery.parseJSON(data);
                if (obj.success == 1) { update_colours("off", 1) }
                else { error_call(2) }
            }).fail(function () { error_call(7) });
    });
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
            if(obj.success == 1) {
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
        }).fail(function () { error_call(7) });
    }
};

var update_brightness = function(level) {
    $(".brightnessToggle").removeClass("toggleActive");
    if (level == "0.3") {
        $("._1").addClass("toggleActive");
    } else if (level == "0.5") {
        $("._2").addClass("toggleActive");
    } else if (level == "0.7") {
        $("._3").addClass("toggleActive");
    } else if (level == "1.0") {
        $("._4").addClass("toggleActive");
    } else {
        error_call(6);
    }
};

var brightness_intent = function() {
    $(".brightnessToggle").click(function() {
        var level = $(this).attr("class").replace("material-icons brightnessToggle ","");
        $.post("", { id: Cookies.get("userKey"), server_key: Cookies.get("serverKey"), type: "intent_bright", level:level},
            function(data, status){
                get_brightness();
            }).fail(function () { error_call(7) });
    });
};

var get_brightness = function() {
    $.post("", { id: Cookies.get("userKey"), server_key: Cookies.get("serverKey"), type: "get_brightness"},
        function(data, status){
            var obj = jQuery.parseJSON(data);
            if (obj.success == 1) { update_brightness(obj.level) }
            else { error_call(5) }
        }).fail(function () { error_call(7) });
};

var set_loc = function(location) {
    Cookies.set("loc", location);
};

var navigation = function() {
    set_loc("splash");

    $(".sectionCard").click(function() {
        var section = $(this).attr('class').replace("sectionCard ","").replace(" noTouch", "");
        $(".splash").fadeOut(300);
        if (section == "simpleSection") {
            $(".plainColours").delay(300).fadeIn(300);
            $("html").css("background-color", "#3e3e3e");
            set_loc("plainColours");
        }
        else if (section == "effectsSection") {
            $(".effectsColours").delay(300).fadeIn(300);
            set_loc("effectsColours");
        }
        else if (section == "settingSection") {
            $(".settings").delay(300).fadeIn();
            $("html").css("background-color", "#3e3e3e");
            set_loc("settings");
            get_brightness();
        }
        $(".back").fadeIn(200);
    });

    $(".navAllColours").click(function() {
        set_loc("allColours");
        $(".plainColours").fadeOut(300);
        $(".allColours").delay(300).fadeIn(300);
    });

    $(".back").click(function() {
        $("html").css("background-color", "#222");
        $("." + Cookies.get("loc")).fadeOut(300);
        if (Cookies.get("loc") == "allColours") {
            set_loc("plainColours");
        }
        else {
            set_loc("splash");
            $(".back").fadeOut(200);
        }
        $("." + Cookies.get("loc")).delay(300).fadeIn(300);
    });
};


var get_uid = function() {
    var oneTimeKey;
    $.post("", { type: "get_uid" },
        function(data, status){
            var obj = jQuery.parseJSON(data);
            oneTimeKey = obj.newID;
            Cookies.set("userKey", oneTimeKey);
        }).fail(function () { error_call(7) });
};

var main = function() {
    get_uid();
    navigation();
    create_colours();
    effect_peek();
    brightness_intent();
    detailed_colours();
    colour_intent_binder(); // Relies on create_colours() having finished
    power_intent();

};

$(document).ready(main);
