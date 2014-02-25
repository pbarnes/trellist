var app;
if (/^0.11/.test(process.versions.node))
  try {
    app = require('./lib/app-koa');
  } catch(e) {
    if (e instanceof SyntaxError && /^Unexpected token/.test(e.message)) {
      console.log('You must run Koa with the --harmony flag to enable generators\n\n');
      process.exit(0);
    }
    else {
      throw e
    }
  }
else
  app = require('./lib/app-express');

app.listen(3000);
console.log("Now listening on port 3000");
