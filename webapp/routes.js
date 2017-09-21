/*
 * app.js Express server with sample module
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
  configRoutes,
  dbHandle,
  MongoClient = require('mongodb').MongoClient,
                test = require('assert'),
  ObjectID = require('mongodb').ObjectID,
// Connection url
  url = 'mongodb://localhost:27017/spa',
  objTypeMap = { 'user': {} }

//  ------------------------ END MODULE SCOPE VARIABLES ----------------

//  ------------------------ BEGIN PUBLIC METHODS ----------------------
configRoutes = function ( app, server ) {
  app.get( '/', function ( request, response ) {
    response.redirect( '/spa.html' );
  });

  app.all( '/:obj_type/*?', function ( request, response, next ) {
    response.contentType( 'json' );
    if ( objTypeMap[ request.params.obj_type ] ) {
      next();
    }
    else {
      response.send({ error_msg : request.params.obj_type + ' is not a valid object type'})
    }
  });

  app.get( '/:obj_type/list', function ( request, response ) {
    // Connect using MongoClient

    MongoClient.connect(url, function(err, db) {
      db.collection( request.params.obj_type )
        .find()
        .toArray(
            function ( err, result ) {
              response.send( result );
              db.close;
        });
    });
  });


  app.post( '/:obj_type/create', function ( request, response ) {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      console.log( request.body);
      var obj_map = request.body;
      db.collection( request.params.obj_type )
        .insertOne(obj_map, function(err, res) {
          if (err) throw err;
          //response.send({ title: request.params.obj_type + ' created'});
          response.send( request.body );
          response.send( res );
          console.log("1 document inserted");
          db.close();
          });
    });
  });

  app.get( '/:obj_type/read/:id', function ( request, response ) {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var find_map = { _id: ObjectID(request.params.id) };
      db.collection( request.params.obj_type )
        .findOne( find_map, function(err, result) {
          if (err) throw err;
          response.send({
            title: request.params.obj_type + ' with id '
            + request.params.id + ' found'
          });
          console.log(result);
          db.close();
      });
    });
  });

  app.post( '/:obj_type/update/:id', function ( request, response ) {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var find_map = { _id: ObjectID(request.params.id) };
      var obj_map = request.body;
      console.log( find_map );
      console.log( obj_map );
      db.collection( request.params.obj_type )
        .updateOne(find_map, obj_map, function(err, res) {
          if (err) throw err;
          response.send({
            title: request.params.obj_type + ' with id '
            + request.params.id + ' found'
          });
          console.log("1 document updated");
          db.close();
        });
    });
  });

  app.get( '/:obj_type/delete/:id', function ( request, response ) {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var find_map = { _id: ObjectID(request.params.id) };
      db.collection( request.params.obj_type )
        .deleteOne(find_map, function(err, obj) {
          if (err) throw err;
          response.send({
            title: request.params.obj_type + ' with id '
            + request.params.id + ' found'
          });
          console.log("1 document deleted");
          db.close();
        });
    });
  });
};
module.exports = { configRoutes : configRoutes };
//  ------------------------ END PUBLIC METHODS -----------------------
