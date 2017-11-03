var fs = require('fs');
var ip = require('ip');
var path  = require('path');
var crypto = require('crypto');
var express = require('express');
var spawn = require('child_process').spawn;
var bodyParser = require('body-parser');

var session_key;
var UIDs = [0];                 // Used Unique IDs
var intents = [0];              // Used intent IDs
var UIDs_Auth = [];             // Auth'd UIDs (hashed)
// var current_col = "000000";     // Current NeoPixel value
global.globalBrightness = "1.0";
global.logName = "";

var app = express();
var staticPath = path.join(__dirname, '/public');
var opcodes = JSON.parse(fs.readFileSync('opcodes.json', 'utf8'));


app.use(express.static(staticPath));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
      extended: true
}));

// Read JSON file containing opcode values
var lookup_code = function(userReq) {
    var pixelCode = opcodes[userReq];
    return pixelCode;
};


var create_log = function() {
    var d = new Date();
    d.setSeconds(0,0);
    logName = d.toISOString().replace(":00.000Z", "").replace("T", "_").replace(":", "");
    logName = "logs/server/" + logName + ".log";
};

// Write all output to log file
var write_log = function(text) {
    console.log(text);
    text.replace("\n", "\r\n");
    text = "\r\n" + text;
    fs.appendFile(logName, text, function(err) {
      if (err) throw err;
    });
};


// Python cild process spawner
var python_intent = function(userReq, type) {
    var pyHandler = spawn("python", ["pixel_handler.py"]);
    var pyOutput = "";
    var pixelCode = lookup_code(userReq);
    var newIntent = intents[intents.length - 1] + 1;
    intents.push(newIntent);
    if (type == 2) { globalBrightness = pixelCode.replace("b","") }
    var packet = {"iid":newIntent, "type":type.toString(), "value":pixelCode}
    pyHandler.stdout.on("data", function(data) {
        pyOutput += data.toString();
    });
    pyHandler.stdout.on("end", function() {
        write_log("[SERVR] PyHandler res: " + pyOutput);

    });
    pyHandler.stdin.write(JSON.stringify(packet));
    pyHandler.stdin.end();
};


// Simple hash, not used for security, used to track clients
var make_hash = function(input) {
    var shasum = crypto.createHash('sha1');
    shasum.update(input.toString());
    return shasum.digest('hex');
};


// I know this isn't secure, but think about the project's context
// Used to determine between clients that have both been Auth'd, but
// the client was Auth'd in a previous server session, no longer valid
var server_session = function() {
    var seed = Math.floor(Math.random() * 100) + 1;
    session_key = make_hash(seed);
};


// I know this isn't secure but the only reason I have a weak passcode
// is to stop flatmates on the same wifi from having access
// Set the passcode here.
var valid_pass = function(user) {
    var shasum = crypto.createHash('sha1');
    shasum.update("1234");
    if (user == shasum.digest('hex')) { return true; }
    else { return false; }
};


// Validate incoming intent from client
var valid_intent = function(UID, server_key) {
    var valid = false;
    UIDs_Auth.forEach(function(value){
        if (value == UID) { valid = true; }
    });
    valid &= (server_key == session_key);
    return valid;
};


// Periodically print the currently authenticated clients
var server_sweep = function() {
    var d = new Date();
    d.setSeconds(0,0);
    var time = d.toISOString().replace(":00.000Z", "");
    write_log("----------------\n" + time + "\n----------------\n[SERVR] Current Auth'd users: ");
    UIDs_Auth.forEach(function(value){
        write_log("[" + value.substr(0,5) + "]");
    });
};


// Validate the data sent by the client
var validate_request = function(body) {
    keys = Object.keys(body);
    if (keys.length < 1 || keys.length > 5) { return false }
    var acceptedKeys = ['colour', 'effect_type', 'id', 'level', 'passcode', 'server_key', 'type'];
    // At most O(7n) runtime as accepted keys is fixed
    for (var i = 0; i < keys.length; i++) {
        var userKey = keys[i];
        var inList = false;
        for (var j = 0; j < acceptedKeys.length; j++) {
            inList = inList | (userKey == acceptedKeys[j]);
        }
        if (!inList) { return false }
        if (userKey == "id" || userKey == "server_key" || userKey == "passcode") {
            if (body[userKey] == undefined) { return false }
        }
        var acceptedKeyPairs = {'get_uid':1, 'get_brightness':1, 'intent_auth':1, 'intent_colour':1, 'intent_effect':1, 'intent_bright':1, 'intent-off':1};
        if (opcodes[body[userKey]] == undefined && body[userKey] == undefined) { return false }
    }
    return true;
};


// POST method route
app.post('/', function (req, res) {
    if (validate_request(req.body) == true) {
        var type = req.body.type;

        // Client requests a UID
        if (type == "get_uid") {
            var newID = UIDs[UIDs.length - 1] + 1;
            UIDs.push(newID);
            responseUID = make_hash(newID);

            var response = '{"type":"get","newID":"' + responseUID + '"}';
            write_log("["+ responseUID.substr(0, 5) + "] GET_UID");
        }

        if (type == "get_brightness") {
            var valid = valid_intent(req.body.id, req.body.server_key);
            if (valid == true) {
                write_log("[" + req.body.id.substr(0,5) + "] GET_BRIGHT");
                var response = '{"type":"get","success":1,"level":"' + globalBrightness + '"}';
            }
            else {
                write_log("[" + req.body.id.substr(0,5) + "] GET_BRIGHT: BAD AUTH");
                var response = '{"type":"get","success":"false"}';
            }
        }

        // Client attempts authentication
        else if (type == "intent_auth") {
            var passHash = make_hash(req.body.passcode);
            var success = valid_pass(passHash).toString();
            var hashID = req.body.id;
            write_log("[" + hashID.substr(0,5) + "] INTENT_AUTH: " + success);
            if (success == "true") {
                UIDs_Auth.push(hashID);
                var response = '{"type":"intent","success":1,"session":"'+ session_key +'"}';
            } else {
                var response = '{"type":"intent","success":"false"}';
            }
        }

        // Client selects a colour
        else if (type == "intent_colour") {
            var valid = valid_intent(req.body.id, req.body.server_key);
            if (valid == true) {
                write_log("[" + req.body.id.substr(0,5) + "] INTENT_COLOUR: " + req.body.colour);
                var colourSelected = req.body.colour;
                var response = '{"type":"intent","success":1,"colour":"' + colourSelected + '"}';
                python_intent(req.body.colour, 0);
            }
            else {
                write_log("[" + req.body.id.substr(0,5) + "] INTENT_COLOUR: BAD AUTH");
                var response = '{"type":"intent","success":"false"}';
            }
        }

        else if (type == "intent_effect") {
            var valid = valid_intent(req.body.id, req.body.server_key);
            if (valid == true) {
                write_log("[" + req.body.id.substr(0,5) + "] INTENT_EFFECT: " + req.body.effect_type);
                var effectSelected = req.body.effect_type;
                var response = '{"type":"intent","success":1,"effect":"' + effectSelected + '"}';
                python_intent(effectSelected, 1);
            }
            else {
                write_log("[" + req.body.id.substr(0,5) + "] INTENT_EFFECT: BAD AUTH");
                var response = '{"type":"intent","success":"false"}';
            }
        }

        else if (type == "intent_bright") {
            var valid = valid_intent(req.body.id, req.body.server_key);
            if (valid == true) {
                write_log("[" + req.body.id.substr(0,5) + "] INTENT_BRIGHT: " + req.body.level);
                var brightLevel = req.body.level;
                // globalBrightness = brightLevel;
                var response = '{"type":"intent","success":1,"level":"' + brightLevel + '"}';
                python_intent(brightLevel, 2);
            }
            else {
                write_log("[" + req.body.id.substr(0,5) + "] INTENT_EFFECT: BAD AUTH");
                var response = '{"type":"intent","success":"false"}';
            }
        }

        // Client selects power off (for the LEDs)
        else if (type == "intent_off") {
            var valid = valid_intent(req.body.id, req.body.server_key);
            if (valid == true) {
                write_log("[" + req.body.id.substr(0,5) + "] INTENT_OFF");
                var response = '{"type":"intent","success":1}';
                python_intent("off", 0);
            }
            else {
                write_log("[" + req.body.id.substr(0,5) + "] INTENT_OFF: BAD AUTH");
                var response = '{"type":"intent","success":"false"}';
            }
        }
    }
    else {
        var response = '{"type":"server","success":"false"}';
    }
    res.send(response);
})

create_log();
write_log('\n--- Node Version: ' + process.version + ' ---');
server_session();
setInterval(server_sweep, 60000);

app.listen(8080, function() {
    write_log('Running on LAN ' + ip.address());
    write_log('Express HTTP server on listening on port 8080');
    write_log('Server session_key: [ '+ session_key.substr(0,10) +'... ]');
    python_intent("serverStart", 3);
});
