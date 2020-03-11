const express  = require('express'),
    app        = express(),
    bodyParser = require('body-parser'),
    cors       = require('cors'),
    jwt        = require('jsonwebtoken'),
    jwtPass = 'uNpASSWORDuNp0c0Malo97531';

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

module.exports = {
    app        : app,
    bodyParser : bodyParser,
    cors       : cors,
    jwt        : jwt,
    jwtPass    : jwtPass,
}