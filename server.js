console.log('\n\n--- Node Version: ' + process.version + ' ---');

var fs = require('fs');
var ip = require('ip');
var path  = require('path');
var crypto = require('crypto');
var express = require('express');
var spawn = require('child_process').spawn;
var bodyParser = require('body-parser');

var UIDs = [0];
var intents = [0];
var UIDs_Auth = [];
var app = express();
var staticPath = path.join(__dirname, '/public');
var colourObj = JSON.parse(fs.readFileSync('colours.json', 'utf8'));
// console.log(JSON.stringify(colourObj));
// var selection = "cyan";
// console.log(colourObj[selection]);

app.use(express.static(staticPath));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
      extended: true
}));

var lookup_colour = function(colour) {
    var hexColour = colourObj[colour];
    return hexColour;
}

// Basic python spawner, needs LOTS of work
var python_intent = function(colour) {
    var pyHandler = spawn("python", ["pixel_handler.py"]);
    var pyOutput = "";
    var hexColour = lookup_colour(colour);
    var newIntent = intents[intents.length - 1] + 1;
    intents.push(newIntent);

    var packet = {"iid":newIntent, "value":hexColour}
    // console.log(hexColour);

    pyHandler.stdout.on("data", function(data) {
        pyOutput += data.toString();
    });

    pyHandler.stdout.on("end", function() {
        console.log("[SERVR] PyHandler res: " + pyOutput);
    });
    console.log(JSON.stringify(packet));
    pyHandler.stdin.write(JSON.stringify(packet));
    pyHandler.stdin.end();

};

// Simple hash, not used for security, used to track clients
var make_hash = function(input) {
    var shasum = crypto.createHash('sha1');
    shasum.update(input.toString());
    return shasum.digest('hex');
};

// I know this isn't secure but the only reason I have a weak passcode
// is to stop flatmates on the same wifi from having access
var valid_pass = function(user) {
    if (user == "6d492170753211fcde587882d77e1e8dcce1bc27") { return true; }
    else { return false; }
}

// Validate incoming intent from client
var valid_intent = function(UID) {
    var valid = false;
    UIDs_Auth.forEach(function(value){
        if (value == UID) { valid = true; }
    });
    return valid;
};

// Periodically print the currently authenticated clients
var server_sweep = function() {
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

    // Client attempts authentication
    else if (type == "intent_auth") {
        var passHash = make_hash(req.body.passcode);
        var success = valid_pass(passHash).toString();
        var hashID = req.body.id;
        console.log("[" + hashID.substr(0,5) + "] INTENT_AUTH: " + success);
        if (success == "true") {
            UIDs_Auth.push(hashID);
        }
        var response = '{"type":"intent","success":"' + success + '"}';

    }

    // Client selects a colour
    else if (type == "intent_colour") {
        var valid = valid_intent(req.body.id);
        if (valid == true) {
            console.log("[" + req.body.id.substr(0,5) + "] INTENT_COLOUR: " + req.body.colour);
            var colourSelected = req.body.colour;
            var response = '{"type":"intent","success":"' + valid + '","colour":"' + colourSelected + '"}';
            python_intent(req.body.colour);
        }
        else {
            console.log("[" + req.body.id.substr(0,5) + "] INTENT_COLOUR: BAD AUTH");
            var response = '{"type":"intent","success":"false"}';
        }
    }

    // Client selects power off (for the LEDs)
    else if (type == "intent_off") {
        var valid = valid_intent(req.body.id);
        if (valid == true) {
            console.log("[" + req.body.id.substr(0,5) + "] INTENT_OFF");
            var response = '{"type":"intent","success":"' + valid + '"}';
            python_intent("off");
        }
        else {
            console.log("[" + req.body.id.substr(0,5) + "] INTENT_OFF: BAD AUTH");
            var response = '{"type":"intent","success":"false"}';
        }
    }

    res.send(response);
})

setInterval(server_sweep, 10000);

app.listen(8080, function() {
    console.log('Running on LAN ' + ip.address());
    console.log('Express HTTP server listening on port 8080');
});
