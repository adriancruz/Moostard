var express = require('express');
var router = express.Router();
var twilio = require('twilio');

// POST: '/ivr/welcome'
router.post('/welcome', twilio.webhook({validate: false}), function (request, response) {
    var twiml = new twilio.TwimlResponse();
    twiml.gather({
        action: "/ivr/menu",
        numDigits: "1",
        method: "POST"
    }, function (node) {
        node.say("Hi! A user from the Berlin Number wants to speak with you. " +
        "If you wish to accept the call, press 1." +
        "If you want to opt out of the Berlin Number initiative, press 2.",
        {voice: "alice", language: "en-GB"});;
    });
    response.send(twiml);
});

// POST: '/ivr/menu'
router.post('/menu', twilio.webhook({validate: false}), function (request, response) {
    var selectedOption = request.body.Digits;
    var optionActions = {
        "1": forwardCall,
        "2": optOutConfirmation
    };

    if (optionActions[selectedOption]) {
        var twiml = new twilio.TwimlResponse();
        optionActions[selectedOption](twiml);
        response.send(twiml);
    }
    else {
        response.send(redirectWelcome());
    }
});

// POST: '/ivr/unsubscribe'
router.post('/unsubscribe', twilio.webhook({validate: false}), function (request, response) {
    var selectedOption = request.body.Digits;
    var optionActions = {
        "1": optedOut
    };

    if (optionActions[selectedOption]) {
        var twiml = new twilio.TwimlResponse();
        optionActions[selectedOption](twiml);
        response.send(twiml);
        /*
        Actual unsubscribe goes here
        */
    }
    else {
        response.send(redirectWelcome());
    }
});

var redirectWelcome = function () {
    var twiml = new twilio.TwimlResponse();
    twiml.say("Returning to the main menu", {voice: "alice", language: "en-GB"});
    twiml.redirect("/ivr/welcome");
    return twiml;
};

var forwardCall = function (twiml) {
    twiml.say("Thank you. Your are being connected to the user. We wish you a wonderful experience.",
        {voice: "alice", language: "en-GB"});

    /*
    Actual forward code goes here
    */
    return twiml;
};

var optOutConfirmation = function (twiml) {
    twiml.gather({
        action: "/ivr/unsubscribe",
        numDigits: "1",
        method: "POST"
    }, function (node) {
        node.say("Are you sure you want to opt out?" +
            "To confirm press 1." +
            "To cancel and remain in the initiative press 2.",
            {voice: "alice", language: "en-GB", loop: 3});
    });
    return twiml;
};

var optedOut = function (twiml) {
    twiml.say("You have opted out of the Berlin Number initiative. Thank you for your participation.",
        {voice: "alice", language: "en-GB"});

    twiml.hangup();
    return twiml;
};


module.exports = router;
