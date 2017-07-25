console.log('\n\n--- Node Version: ' + process.version + ' ---');

//var http = require('http');
//var url = require('url');
//var fs = require('fs');
var path  = require('path');
var crypto = require('crypto');
var express = require('express');
var bodyParser = require('body-parser');

var UIDs = [0];
var UIDs_Auth = [];
var app = express();
var staticPath = path.join(__dirname, '/public');

app.use(express.static(staticPath));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
      extended: true
})); 


// Simple hash, not used for security
var make_hash = function(input) {
    var shasum = crypto.createHash('sha1');
    shasum.update(input.toString());
    return shasum.digest('hex');
};

var valid_pass = function(user) {
    if (user == "6d492170753211fcde587882d77e1e8dcce1bc27") {
        return true;
    }
    else {
        return false;
    }
    
}

var server_sweep = function() {
    console.log("Current Auth'd users: ");
    UIDs_Auth.forEach(function(value){
        console.log(value.substr(0,5));
    });
};

// POST method route
app.post('/', function (req, res) {
    var type = req.body.type;
    
    if (type == "get_uid") {
        var newID = UIDs[UIDs.length - 1] + 1;
        UIDs.push(newID);
        responseUID = make_hash(newID);
        
        var response = '{"type":"get","newID":"' + responseUID + '"}';
        console.log("["+ responseUID.substr(0, 5) + "] GET_UID");
    }
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
    else if (type == "intent_colour") {
        console.log("[" + req.body.id.substr(0,5) + "] INTENT_COLOUR: " + req.body.colour);
        var colourSelected = req.body.colour;
        var response = '{"type":"intent","colour":"' + colourSelected + '"}';    
    }
    
    res.send(response);
//    console.log("Responded to client")
})

setInterval(server_sweep, 10000);

app.listen(8080, function() {
    console.log('Express HTTP server listening on port 8080');
});