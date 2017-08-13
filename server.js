console.log('\n\n--- Node Version: ' + process.version + ' ---');

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
global.globalBrightness = 1;

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


// Basic python spawner, needs LOTS of work
var python_intent = function(userReq, type) {
    var pyHandler = spawn("python", ["pixel_handler.py"]);
    var pyOutput = "";
    var pixelCode = lookup_code(userReq);
    var newIntent = intents[intents.length - 1] + 1;
    intents.push(newIntent);

    var packet = {"iid":newIntent, "type":type.toString(), "value":pixelCode}

    pyHandler.stdout.on("data", function(data) {
        pyOutput += data.toString();
    });
    pyHandler.stdout.on("end", function() {
        console.log("[SERVR] PyHandler res: " + pyOutput);
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
// one was Auth'd in a previous server session, so is an old client
var server_session = function() {
    var seed = Math.floor(Math.random() * 100) + 1;
    session_key = make_hash(seed);
};


// I know this isn't secure but the only reason I have a weak passcode
// is to stop flatmates on the same wifi from having access
var valid_pass = function(user) {
    if (user == "6d492170753211fcde587882d77e1e8dcce1bc27") { return true; }
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
    python_intent("getBright", 3);
    console.log("\n[SERVR] Current Auth'd users: ");
    UIDs_Auth.forEach(function(value){
        console.log(value.substr(0,5));
    });
};

// POST method route
app.post('/', function (req, res) {
    var type = req.body.type;

    // Client requests a UID
    if (type == "get_uid") {
        var newID = UIDs[UIDs.length - 1] + 1;
        UIDs.push(newID);
        responseUID = make_hash(newID);

        var response = '{"type":"get","newID":"' + responseUID + '"}';
        console.log("["+ responseUID.substr(0, 5) + "] GET_UID");
    }

    if (type == "get_brightness") {
        var valid = valid_intent(req.body.id, req.body.server_key);
        if (valid == true) {
            console.log("[" + req.body.id.substr(0,5) + "] GET_BRIGHT");
            var response = '{"type":"get","success":"true","level":"' + globalBrightness + '"}';
            python_intent("getBright", 3);
        }
        else {
            console.log("[" + req.body.id.substr(0,5) + "] GET_BRIGHT: BAD AUTH");
            var response = '{"type":"get","success":"false"}';
        }
    }

    // Client attempts authentication
    else if (type == "intent_auth") {
        var passHash = make_hash(req.body.passcode);
        var success = valid_pass(passHash).toString();
        var hashID = req.body.id;
        console.log("[" + hashID.substr(0,5) + "] INTENT_AUTH: " + success);
        if (success == "true") {
            UIDs_Auth.push(hashID);
            var response = '{"type":"intent","success":"true","session":"'+ session_key +'"}';
        } else {
            var response = '{"type":"intent","success":"false"}';
        }
    }

    // Client selects a colour
    else if (type == "intent_colour") {
        var valid = valid_intent(req.body.id, req.body.server_key);
        if (valid == true) {
            console.log("[" + req.body.id.substr(0,5) + "] INTENT_COLOUR: " + req.body.colour);
            var colourSelected = req.body.colour;
            var response = '{"type":"intent","success":"true","colour":"' + colourSelected + '"}';
            python_intent(req.body.colour, 0);
        }
        else {
            console.log("[" + req.body.id.substr(0,5) + "] INTENT_COLOUR: BAD AUTH");
            var response = '{"type":"intent","success":"false"}';
        }
    }

    else if (type == "intent_effect") {
        var valid = valid_intent(req.body.id, req.body.server_key);
        if (valid == true) {
            console.log("[" + req.body.id.substr(0,5) + "] INTENT_EFFECT: " + req.body.effect_type);
            var effectSelected = req.body.effect_type;
            var response = '{"type":"intent","success":"true","effect":"' + effectSelected + '"}';
            python_intent(effectSelected, 1);
        }
        else {
            console.log("[" + req.body.id.substr(0,5) + "] INTENT_EFFECT: BAD AUTH");
            var response = '{"type":"intent","success":"false"}';
        }
    }

    else if (type == "intent_bright") {
        var valid = valid_intent(req.body.id, req.body.server_key);
        if (valid == true) {
            console.log("[" + req.body.id.substr(0,5) + "] INTENT_BRIGHT: " + req.body.level);
            var brightLevel = req.body.level;
            var response = '{"type":"intent","success":"true","level":"' + brightLevel + '"}';
            python_intent(brightLevel, 2);
        }
        else {
            console.log("[" + req.body.id.substr(0,5) + "] INTENT_EFFECT: BAD AUTH");
            var response = '{"type":"intent","success":"false"}';
        }
    }


    // Client selects power off (for the LEDs)
    else if (type == "intent_off") {
        var valid = valid_intent(req.body.id, req.body.server_key);
        if (valid == true) {
            console.log("[" + req.body.id.substr(0,5) + "] INTENT_OFF");
            var response = '{"type":"intent","success":"true"}';
            python_intent("off", 0);
        }
        else {
            console.log("[" + req.body.id.substr(0,5) + "] INTENT_OFF: BAD AUTH");
            var response = '{"type":"intent","success":"false"}';
        }
    }

    res.send(response);
})

server_session();
setInterval(server_sweep, 10000);

app.listen(8080, function() {
    console.log('Running on LAN ' + ip.address());
    console.log('Express HTTP server on listening on port 8080');
    console.log('Server session_key: [ '+ session_key.substr(0,10) +'... ]')
    console.log(globalBrightness);
});
