var serve = require('koa-static'),
koa       = require('koa'),
app       = koa(),
log       = console.log;

log("Serving up PUBLIC");
app.use(serve('public'));

if (!module.parent) {
  app.listen(3000);
  log("Now listening on port 3000");
}
