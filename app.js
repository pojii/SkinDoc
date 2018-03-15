/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework.
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");
var fetch = require('node-fetch');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({appId: process.env.MicrosoftAppId, appPassword: process.env.MicrosoftAppPassword, openIdMetadata: process.env.BotOpenIdMetadata});

// Listen for messages from users
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot.
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({
    gzipData: false
}, azureTableClient);

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);
bot.set('storage', tableStorage);

bot.dialog('/', function (session) {
    //console.log(session.message.attachments[0].contentUrl,'contentUrl');
    if (session.message.attachments.length > 0) {
        
        api('https://southcentralus.api.cognitive.microsoft.com/customvision/v1.1/Prediction/1f32e321-220b-4dca-a709-5be05765d185/url?iterationId=1baed895-25d7-481a-98be-592003db82f1',
        session.message.attachments[0].contentUrl).then((output) => {
            
            if(Math.floor(output.Predictions[0].Probability*100)==0){
                    session.send('Please send Picture Again')
            }else{
                console.log(output,'output+++++')
                session.send(output.Predictions[0].Tag+ " " + Math.floor(output.Predictions[0].Probability*100) + '%\n' +
                    output.Predictions[1].Tag+ " " + Math.floor(output.Predictions[1].Probability*100) + '%\n' //+
                    //output.Predictions[2].Tag+ "\t\t" + Math.floor(output.Predictions[2].Probability*100) + '%\n' +
                    //output.Predictions[3].Tag+ "\t\t" + Math.floor(output.Predictions[3].Probability*100) + '%\n' +
                    //output.Predictions[4].Tag+ "\t\t" + Math.floor(output.Predictions[4].Probability*100) + '%\n' +
                    //output.Predictions[5].Tag+ "\t\t" + Math.floor(output.Predictions[5].Probability*100) + '%\n' 
            )
            }
            
            
        })
    } else 
        session.send('Please Send Picture to Predict disease');
    }
);

function api(url, picUrl) {
    return fetch(url, {
        method: 'post',

        headers: {
            'Prediction-Key': 'c04f847425b445f2bedc3b2a36dac65f',
            'content-type': 'application/json'
        },
            body: JSON.stringify({Url: picUrl})
        })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            return data;
        });
}