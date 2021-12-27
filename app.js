const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const request = require('request');

const app = express();
const herokuPort = process.env.PORT;
const localPort = 3000;


app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/signup.html');
});

app.post('/', function (req, res) {
    let request = https.request(getMailChimpPostUrl(), getPostOptions(), function (response) {
        response.on('data', function (data) {
            console.log(JSON.parse(data));
            if (response.statusCode != 200) {
                res.sendFile(__dirname + '/failure.html');
                return;
            }
            res.sendFile(__dirname + '/success.html');
        });
    }).on('error', function (error) {
        console.log(error.message);
        res.sendFile(__dirname + '/failure.html');
    });
    request.write(createMailChimpPayload(
        req.body.firstName,
        req.body.lastName,
        req.body.email
    ));
    request.end();
});

app.post('/success', function (req, res) {
    res.redirect('/');
});

app.post('/failure', function (req, res) {
    res.redirect('/');
});

app.listen(port || herokuPort, function () {
    console.log(`Listening on port ${port}...`);
});

function getMailChimpPostUrl() {
    const mailChimpDC = 'us20'
    const mailChimpUrl = `https://${mailChimpDC}.api.mailchimp.com/3.0`;
    const listID = '18a3615c3f'
    const urlPostAddendum = `/lists/${listID}?skip_merge_validation=true&skip_duplicate_check=true`
    return mailChimpUrl + urlPostAddendum;
}

function getPostOptions() {
    const apiKey = '00d5787fcd9731edf08bbaa6fa5dff01-us20'
    const options = {
        method: 'POST',
        auth: `riccardt:${apiKey}`
    }
    return options;
}

function createMailChimpPayload(firstName, lastName, email) {
    const payload = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName,
                }
            }
        ]
    }
    return JSON.stringify(payload);
};

// function createHtmlFrom(userData) {
//     let html = `
//     <h1>${userData.firstName}</h1>
//     <h1>${userData.lastName}</h1>
//     <h2>${userData.email}</h2>
//     `;
//     return html;
// };


// API: 00d5787fcd9731edf08bbaa6fa5dff01-us20
// List ID: 18a3615c3f

