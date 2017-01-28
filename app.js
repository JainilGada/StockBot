var restify = require('restify');
var builder = require('botbuilder');
var tickername = null;
//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});


var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================
/*
bot.dialog('/', [
    function (session) {
        builder.Prompts.text(session, "Hello... What's your name?");
    },
    function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.number(session, "Hi " + results.response + ", How many years have you been coding?"); 
    },
    function (session, results) {
        session.userData.coding = results.response;
        builder.Prompts.choice(session, "What language do you code Node using?", ["JavaScript", "CoffeeScript", "TypeScript"]);
    },
    function (session, results) {
        session.userData.language = results.response.entity;
        session.send("Got it... " + session.userData.name + 
                    " you've been programming for " + session.userData.coding + 
                    " years and use " + session.userData.language + ".");
    }
]);
*/

var useEmulator = (process.env.NODE_ENV == 'development');

var luisAppId = 'ec29fd45-33b1-44de-aca2-4ef200d9dd50';
var luisAPIKey = '896961d97d58402b91de347a92641079'
var luisAPIHostName = process.env.LuisAPIHostName || 'api.projectoxford.ai';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({
        recognizers: [recognizer]
    })
    /*
    .matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
    */
    .matches('GetPrice', (session, args) => {
        var companyName = builder.EntityRecognizer.findEntity(args.entities, "CompanyName");
		if(!companyName)
		{
			companyName = builder.Prompts.text(session,"What is the Company Name?");
			url = "https://www.quandl.com/api/v3/datasets.json?query=" + companyName + "&database_code=NSE&per_page=1&page=1&";
		}
		else{
        session.send('Getting Data for  \'%s\'.', companyName.entity);
        url = "https://www.quandl.com/api/v3/datasets.json?query=" + companyName.entity + "&per_page=1&page=1";

		}
		var http = require("https");
        
        var request = http.get(url, function(response) {
            // data is streamed in chunks from the server
            // so we have to handle the "data" event    
            var buffer = "",
                data,
                route;

            response.on("data", function(chunk) {
                buffer += chunk;
            });

            response.on("end", function(err) {
                // finished transferring data
                // dump the raw data
                //console.log(buffer);
                //console.log("\n");
                data = JSON.parse(buffer);
                abc = data.datasets;
				
                tickername = abc[0].dataset_code;
				database_code = abc[0].database_code;
                //tickername = route.dataset_code;

                // extract the distance and time

                console.log("SYM: " + tickername);
                //  console.log("Time: " + route.legs[0].duration.text);
                session.send("Price of \'%s\' ", tickername);
                url1 = "https://www.quandl.com/api/v3/datasets/"+database_code+"/" + tickername + ".json?api_key=3rmf8-xvrxu3XPXPhZHj&limit=1";
                var request = http.get(url1, function(response) {
                    // data is streamed in chunks from the server
                    // so we have to handle the "data" event    
                    var buffer = "",
                        data,
                        route;

                    response.on("data", function(chunk) {
                        buffer += chunk;
                    });

                    response.on("end", function(err) {
                        // finished transferring data
                        // dump the raw data
                        //console.log(buffer);
                        //console.log("\n");
                        data = JSON.parse(buffer);
                        route = data.dataset;

						console.log(data);
                        // extract the distance and time
                        //console.log("name: " + route.name);
                        //console.log("Date: " + route.data[0][0]);      
                        //  console.log("Time: " + route.legs[0].duration.text);
						if(!data)
							session.send("Oops!\nThe company is not a part of NSE!!");
							else
                        session.send("Price of \'%s\' is \'%s\' ", route.name, route.data[0]['open']);
                    });
                });
            });
        });

    })

    .matches('SellStock', (session, args) => {

        session.send('Hi! This is the SellStock intent handler. You said: \'%s\'.', session.message.text);
    })

    .matches('BuyStock', (session, args) => {

        session.send('Hi! This is the BuyStock intent handler. You said: \'%s\'.', session.message.text);
    })

    .matches('HighestDayValue', (session, args) => {

        session.send('Hi! This is the high value intent handler. You said: \'%s\'.', session.message.text);
    })

    .onDefault((session) => {
        session.send('Sorry, I did not understand \'%s\'.', session.message.text);
    });

bot.dialog('/', intents);

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());
} else {
    module.exports = {
        default: connector.listen()
    }
}