/**
 * Created by K2 on 12/12/2016.
 */
/**
 * Created by K2 on 12/11/2016.
 */
"use strict";
let AWS = require('aws-sdk');
let https = require('https');
let querystring = require('querystring');
let util = require('util');
const encrypted = process.env['password'];
let  decrypted;

function processEvent(event, context, callback) {
    let data = event.data;
    let post_data = querystring.stringify({
        'email' : process.env.email,
        'password': decrypted,
        'filename': data
    });
    let options = {
        host: process.env.host,
        path: process.env.path,
        port:443,
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data)
        }
    };
    let req = https.request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            context.done();
        });

    });
    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
    // post the data
    req.write(post_data);
    req.end();
}


exports.handler = (event, context, callback) =>{
    console.log('~~~~~~~Inside Notfying Sonicspan ......');
    //   console.log("data:", event.data);
    if (decrypted) {
        processEvent(event, context, callback);
    } else {
        // Decrypt code should run once and variables stored outside of the function
        // handler so that these are decrypted once per container
        const kms = new AWS.KMS();
        kms.decrypt({ CiphertextBlob: new Buffer(encrypted, 'base64') }, (err, data) => {
            if (err) {
                console.log('Decrypt error:', err);
                return callback(err);
            }
            decrypted = data.Plaintext.toString('ascii');
        console.log('decrypted ' + decrypted);
        processEvent(event, context, callback);
    });
    }
};