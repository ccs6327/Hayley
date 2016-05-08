'use strict';

/**
 * App ID for the skill
 */
var APP_ID = "amzn1.echo-sdk-ams.app.8fb22133-282c-4d72-888e-e6fb92620c6c"; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";
var DATA;


// Twilio Credentials 
var accountSid = 'AC79f06cef39ed622097b13ccb6b15b76a';
var authToken = 'd9ce009f5a2204f3aba4b6524f3712b8';
var fromNumber = '+12563845798';

var https = require('https');
var queryString = require('querystring');

/**
 * Database setup. 
 */

var mysql = require('mysql');
var con = mysql.createConnection({
  host     : 'jackdb.cdj8ie7hn84a.us-west-2.rds.amazonaws.com',
  user     : 'jackong93',
  password : 'jackong93',
  database : 'hayley'
});

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * AskHayley is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var AskHayley = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
AskHayley.prototype = Object.create(AlexaSkill.prototype);
AskHayley.prototype.constructor = AskHayley;

AskHayley.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("AskHayley onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here

    // connect to database to prep data
    if (!session.attributes) { // session does not exist yet
        con.connect(function (err) {
            if (err) {
                console.error("error connecting: " + err.stack);
                return;
            }
        })
    }
};

AskHayley.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("AskHayley onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    welcomeMessage(response);
};

/**
 * Overridden to show that a subclass can override this function to teardown session state.
 */
AskHayley.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("AskHayley onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
    // con.end();

};

AskHayley.prototype.intentHandlers = {
    "AskHayleyIntent": function (intent, session, response) {
        handleAskHayley(intent, session, response);
    },

    "AnswerHayleyIntent": function (intent, session, response) {
        handleAskHayley(intent, session, response);
    },

    "AskForUpdateIntent": function (intent, session, response) {
        handleUpdateRequest(intent, session, response);
    },

    "PhoneNumberIntent": function (intent, session, response) {
        handlePhoneNumberRequest(intent, session, response);
    },

    "InputPhoneNumberIntent": function (intent, session, response) {
        inputNewPhoneNumberRequest(intent, session, response);
    },

    "BossIntent": function (intent, session, response) {
        handleBossIntent(intent, session, response);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("You can ask Hayley who is coming home for dinner, or, you can say nevermind... What can Hayley help you with?", "What can Hayley help you with?");
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Got it. Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Okay then. Goodbye";
        response.tell(speechOutput);
    }
};

function handleAskHayley(intent, session, response) {
    var eventRequest, time, venue;

    if (session.attributes && session.attributes.speechOutput) {
        if (!eventRequest) eventRequest = session.attributes.eventRequest;
        if (!time) time = session.attributes.time;
        if (!venue) venue = session.attributes.venue;
    }

    if (!eventRequest) eventRequest = intent.slots.eventRequest.value;
    if (!time) time = intent.slots.time.value;
    if (!venue) venue = intent.slots.venue.value;

    console.log(eventRequest);

    eventRequest = eventRequest.toLowerCase();

    var speechOutput;

    if (eventRequest === "dinner" || eventRequest === "lunch") {
        if (eventRequest && time && venue) {
            if (venue === "home") {
                speechOutput = "Got it. I am now sending messages asking: are you " + 
                            venue + " for " + eventRequest + " " + time;
            } else {
                speechOutput = "Alright, I am now sending messages asking: do you want to have " + 
                            eventRequest + " at " + venue;
            }
            createRSVP(speechOutput, function() {
                response.tellWithCard(speechOutput, "AskHayley", speechOutput);
            });
        }
        if (eventRequest && venue) {
            if (venue === "home") {
                speechOutput = "Got it. I am now sending messages asking: are you gonna be " + 
                            venue + " for " + eventRequest;
            } else {
                speechOutput = "Alright, I am now sending messages asking: do you wanna have " + 
                            eventRequest + " at " + venue;
            }
            createRSVP(speechOutput, function() {
                response.tellWithCard(speechOutput, "AskHayley", speechOutput);
            });
        }
        if (!venue) {
            speechOutput = "Sure, where do you wanna have " + eventRequest + "?";
            session.attributes.eventRequest = eventRequest;
            session.attributes.speechOutput = speechOutput;
            session.attributes.time = "tonight";
            response.ask(speechOutput);
        }
    }
    if (eventRequest === "movie") {
        if (eventRequest) {
            if (time) {
                session.attributes.time = time;
            }
            speechOutput = "Sounds good. What movie will it be?";
            session.attributes.speechOutput = speechOutput;
            session.attributes.eventRequest = undefined;
            response.ask(speechOutput);
        }
    }
    if (eventRequest === "captain america" || eventRequest === "captain america civil war") {
        if (eventRequest && time) {
            speechOutput = "Alright. I'll send messages asking: are you up for " + eventRequest + " " + time;
            createRSVP(speechOutput, function() {
                response.tell(speechOutput);
            });
        }
        if (!time) {
            speechOutput = "Sure thing. When are you thinking of watching it? You can say general timing like tonight, tomorrow, or tomorrow night";
            session.attributes.eventRequest = eventRequest;
            session.attributes.speechOutput = speechOutput;
            response.ask(speechOutput);
        };
    }
    if (eventRequest === "ex men apocalypse") {
            speechOutput = "The movie's not out yet; If you'd ask me for captain america instead, I can do that for you.";
            response.tell(speechOutput);
    }
}

function handleUpdateRequest(intent, session, response) {
    con.query('SELECT * FROM questions ORDER BY id DESC LIMIT 1', function (err, rows, fields) {
        if (err) throw err;

        var question = rows[0].question;
        var joinedQuery = 'SELECT * FROM responses r INNER JOIN users u on r.user_id = u.id WHERE r.question_id = ' + rows[0].id;
        console.log(joinedQuery);
        var speechOutput;
        con.query(joinedQuery, function (err, rows, fields) {
                if (err) throw err;

                if (rows.length < 5) {
                    var names = [];
                    for (var i in rows) {
                        if (rows[i].response) {
                            names.push(rows[i].user);
                        }
                    }
                    console.log(names);
                    speechOutput = "Hayley here. So far, ";
                    if (names.length == 0) {
                        speechOutput += "nobody said yes yet";
                    } else {
                        for (var i = 0; i < names.length - 1; i++) {
                            speechOutput += names[i] + ", ";
                        };
                        speechOutput += " and " + names[names.length - 1];
                        speechOutput += " said yes";
                    }
                    response.tell(speechOutput);
                } else {
                    var count = 0;
                    for (var i in rows) {
                        if (rows[i].response) {
                            count++;
                        }
                    }
                    console.log(count + "/" + rows.length);
                    speechOutput = "Hayley here. So far, " + count + " people said yes";
                    response.tell(speechOutput);
                }
            });
    });
}

function handlePhoneNumberRequest(intent, session, response) {
    var nameRequested = intent.slots.nameRequested.value;
    console.log("nameRequested: " + nameRequested);

    var queryPredicate = "select phone from users where user = '" + nameRequested + "'";

    con.query(queryPredicate, function(err, rows) {
        if (err) throw err;

        console.log(rows);
        var phoneNumber = "<say-as interpret-as=\"telephone\">" + rows[0].phone + "</say-as>";
        var responseAnswer = "<speak>" + nameRequested + "'s phone number is " + phoneNumber + "</speak>";
        var speechOutput = {"type" : "SSML", "speech" : responseAnswer};
        response.tell(speechOutput);
    })
}

function inputNewPhoneNumberRequest(intent, session, response) {
    var nameRequested = intent.slots.nameRequested.value;
    var phoneNumber = "+1" + intent.slots.phoneNumber.value;

    var speechOutput;

    if (nameRequested && phoneNumber) {
        var queryPredicate = "insert into users (user, phone) values ('" + nameRequested + "','" + phoneNumber + "')";

    con.query(queryPredicate, function(err, rows) {
        if (err) throw err;
        // set phone num to the name
        var responseAnswer = "I just set " + nameRequested + "'s number as " + "<say-as interpret-as=\"telephone\">" + phoneNumber + "</say-as>";
        speechOutput = {"type" : "SSML", "speech" : "<speak>" + responseAnswer + "</speak>"}
        response.tell(speechOutput);
    })

    } else if (!nameRequested && phoneNumber) {
        // there's num, no name
        speechOutput = "I got the number. Whose number shall this be?";
        response.askWithCard(speechOutput, "AskHayley", speechOutput);
    } else {
        // no num, no name
        speechOutput = "I did not get that. Could you repeat that again?";
        response.askWithCard(speechOutput, "AskHayley", speechOutput);
    }
}

function handleBossIntent(intent, session, response) {
    var speechOutput = "psy hou is the boss! It has always been that way.";
    response.tellWithCard(speechOutput, "AskHayley", speechOutput);
}

function welcomeMessage(response) {
    var speechOutput = "Hello there, Hayley here. I can help you ask people for things like if they are coming home for dinner, or if they are up for a movie night. Just ask me: who is interested?";
    response.tellWithCard(speechOutput, "AskHayley", speechOutput);
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the SpaceGeek skill.
    var askHayley = new AskHayley();
    askHayley.execute(event, context);
};

// logic and backend
function SendSMS(to, body) {

    // The SMS message to send
    var message = {
        To: to, 
        From: fromNumber,
        Body: body
    };
    
    var messageString = queryString.stringify(message);
    
    // Options and headers for the HTTP request   
    var options = {
        host: 'api.twilio.com',
        port: 443,
        path: '/2010-04-01/Accounts/' + accountSid + '/Messages.json',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(messageString),
            'Authorization': 'Basic ' + new Buffer(accountSid + ':' + authToken).toString('base64')
        }
    };
    
    // Setup the HTTP request
    var req = https.request(options, function (res) {

        res.setEncoding('utf-8');

        // Collect response data as it comes back.
        var responseString = '';
        res.on('data', function (data) {
            responseString += data;
        });
        
        // Log the responce received from Twilio.
        // Or could use JSON.parse(responseString) here to get at individual properties.
        res.on('end', function () {
            console.log('Twilio Response: ' + responseString);
        });
    });
    
    // Handler for HTTP request errors.
    req.on('error', function (e) {
        console.error('HTTP error: ' + e.message);
        
        // var sessionAttributes = {};
        // var cardTitle = "Sent";
        // var speechOutput = "Unfortunately, sms request has finished with errors.";

        // var repromptText = "";
        // var shouldEndSession = true;

        // callback(sessionAttributes,
        //   buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));

    });
    
    // Send the HTTP request to the Twilio API.
    // Log the message we are sending to Twilio.
    console.log('Twilio API call: ' + messageString);
    req.write(messageString);
    req.end();

}

function createRSVP(speechOutput, callback) {
    con.query('SELECT * FROM users', function(err, rows, fields) {
        if (err) {
            console.log(err);
            throw err;
        }

        console.log("received SendSms intent.");
        var question = speechOutput.split("asking: ")[1];
        var text = "Hayley asked: " + question;
        text += "? To answer, reply 'Yes' or 'No' to this SMS."

        //FIXME: Remove this line to avoid cluttering logs
        console.log(rows);

        var numbers = [];
        
        for (var i in rows) {
            // if (rows[i].user === destination.toLowerCase()) {
                 // found a match with database!
             //     numbers.push(rows[i].phone);
             //     console.log(rows.user + " sssssss " + rows[i].phone);
             //     break;
             // } else {
                // send to everyone
                for (var j in rows) {
                    numbers.push(rows[j].phone);
                }
                console.log("EVERYBARRRRDY");
                console.log(numbers);
                break;
             // }
        }
        
        numbers.forEach(function(number) {
            console.log("Disabled sending real sms for now");
            console.log("Sending sms to : " + number + " with text " + text);
            SendSMS(number, text);
        });  
        
        
        var query = 'insert into questions (question) values ("' + question + '")';
        console.log(query);
        con.query(query, function(err, rows, fields) {   
            if (err) throw err;
            
            // var sessionAttributes = {};
            // var cardTitle = "Sent";
            // var speechOutput = "Ok, Sms sent.";

            // var repromptText = "";
            // var shouldEndSession = true;
            // callback(sessionAttributes,
            //     buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
            console.log("AFTER CALLBACKKKKKKKKKK");
            callback();
        });


    });
}

