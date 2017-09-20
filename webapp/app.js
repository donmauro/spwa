/*
 * app.js Express server with generic routing
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/*global */

//  ------------------------ BEGIN MODULE SCOPE VARIABLES --------------
'use strict';
var
  http     = require( 'http' ),
  express  = require( 'express' ),

  app      = express(),
  server   = http.createServer( app );
//  ------------------------ END MODULE SCOPE VARIABLES --------------

//  ------------------------ BEGIN SERVER CONFIGURATION --------------
app.configure( function () {
  app.use( express.bodyParser() );
  app.use( express.methodOverride() );
  app.use( express.static( __dirname + '/public'));
  app.use( app.router );
});

app.configure( 'development', function () {
  app.use( express.logger() );
  app.use( express.errorHandler({
    dumpExceptions : true,
    showStack      : true
  }) );
});

app.configure( 'production', function () {
  app.use( express.errorHandler() );
});

// all configuraton below are for routes
app.get( '/', function ( request, response ) {
  response.redirect( '/spa.html' );
});

app.all( '/:obj_type/*?', function ( request, response, next ) {
  response.contentType( 'json' );
  next();
});

app.get( '/:obj_type/list', function ( request, response ) {
  response.send({ title: request.params.obj_type +' list'});
});

app.post( '/:obj_type/create', function ( request, response ) {
  response.send({ title: request.params.obj_type + ' created'});
});

app.get( '/:obj_type/read/:id', function ( request, response ) {
  response.send({
    title: request.params.obj_type + ' with id '
    + request.params.id + ' found'
  });
});

app.get( '/:obj_type/update/:id', function ( request, response ) {
  response.send({
    title: request.params.obj_type + ' with id '
    + request.params.id + ' found'
  });
});

app.get( '/:obj_type/delete/:id', function ( request, response ) {
  response.send({
    title: request.params.obj_type + ' with id '
    + request.params.id + ' found'
  });
});

//  ------------------------ END SERVER CONFIGURATION -----------------



server.listen( 3000 );
console.log( 'Exp Listen on port %d in %s mode', server.address().port, app.settings.env );
