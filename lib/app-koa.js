var serve = require('koa-static'),
koa       = require('koa'),
app       = koa(),
log       = console.log;

log("Serving up PUBLIC");
app.use(serve('public'));

module.exports = app
