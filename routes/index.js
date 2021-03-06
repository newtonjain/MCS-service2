var express = require('express');
var router = express.Router();
var summarize = require ("text-summary");
var liveConnect = require('../lib/liveconnect-client');
var createExamples = require('../lib/create-examples');

/* GET Index page */
router.get('/', function (req, res) {
    var authUrl = liveConnect.getAuthUrl();
    res.render('index', { title: 'OneNote API Node.js Sample', authUrl: authUrl});
});

router.get('/meeting', function (req, res) {
    console.log('here are the request parames', req.query.name);

    res.send('Hello World!')
})


/* POST Create example request */
router.post('/meeting2', function (req, res) {

    var accessToken = req.body.accesstoken;
     var text = req.body.text;
     console.log('SAV just sent me//// ', req.body);

    // Render the API response with the created links or with error output
    var createResultCallback = function (error, httpResponse, body) {
        if (error) {
            return res.render('error', {
                message: 'HTTP Error',
                error: {details: JSON.stringify(error, null, 2)}
            });
        }

    };


var numberSentences = 3;

var summary = summarize.summary(text, numberSentences);

console.log(summary);

    console.log('here are the values', accessToken, text);

   createExamples.jarvisCreatePageWithSimpleText(accessToken, createResultCallback, text, summary);
   res.send('Thank you')

});



/* POST Create example request */
router.post('/', function (req, res) {
    var accessToken = req.cookies['access_token'];
    var exampleType = req.body['submit'];
    console.log("MY ACCESS ToKEN "+ accessToken);
    // Render the API response with the created links or with error output
    var createResultCallback = function (error, httpResponse, body) {
        if (error) {
            return res.render('error', {
                message: 'HTTP Error',
                error: {details: JSON.stringify(error, null, 2)}
            });
        }

        // Parse the body since it is a JSON response
        var parsedBody;
        try {
            parsedBody = JSON.parse(body);
        } catch (e) {
            parsedBody = {};
        }
        // Get the submitted resource url from the JSON response
        var resourceUrl = parsedBody['links'] ? parsedBody['links']['oneNoteWebUrl']['href'] : null;

        if (resourceUrl) {
            res.render('result', {
                title: 'OneNote API Result',
                body: body,
                resourceUrl: resourceUrl
            });
        } else {
            res.render('error', {
                message: 'OneNote API Error',
                error: {status: httpResponse.statusCode, details: body}
            });
        }
    };

    // Request the specified create example
    switch (exampleType) {
        case 'text':
            createExamples.createPageWithSimpleText(accessToken, createResultCallback);
            break;
        case 'textimage':
            createExamples.createPageWithTextAndImage(accessToken, createResultCallback);
            break;
        case 'html':
            createExamples.createPageWithScreenshotFromHtml(accessToken, createResultCallback);
            break;
        case 'url':
            createExamples.createPageWithScreenshotFromUrl(accessToken, createResultCallback);
            break;
        case 'file':
            createExamples.createPageWithFile(accessToken, createResultCallback);
            break;
    }
});

module.exports = router;
