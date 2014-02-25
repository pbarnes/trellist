var express = require('express'),
app = express(),
path = require('path');

console.log('Now serving',path.join(__dirname, '..','public'));
app.use(express.static(path.join(__dirname, '..', 'public')));

module.exports = app
