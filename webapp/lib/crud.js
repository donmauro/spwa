/*
 * crud.js module to provide CRUD db capabilities
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
 loadSchema,    checkSchema,    clearIsOnline,
 checkType,     constructObj,   readObj,
 updateObj,     destroyObj,

 MongoClient = require( 'mongodb' ).MongoClient,
 makeMongoId = require( 'mongodb' ).ObjectID,
 fsHandle    = require( 'fs' ),
 JSV         = require( 'JSV' ).JSV,

 validator   = JSV.createEnvironment(),
// Connection url
 url = 'mongodb://localhost:27017/spa',
 objTypeMap = { 'user': {} };
//  ------------------------ END MODULE SCOPE VARIABLES  ----------------

//  ------------------------ BEGIN UTILITY METHODS ----------------------
loadSchema = function ( schema_name, schema_path ) {
  fsHandle.readFile( schema_path, 'utf8', function ( err, data ) {
    objTypeMap[ schema_name ] = JSON.parse( data );
  });
};

checkSchema = function ( obj_type, obj_map, callback ) {
  var
    schema_map = objTypeMap[ obj_type ],
    report_map = validator.validate(obj_map, schema_map );
  callback ( report_map.errors );
};

clearIsOnline = function () {
  updateObj(
    'user',
    { is_online : true  },
    { is_online : false },
    function ( response_map ) {
      console.log( 'All users set to offline', response_map );
    }
  );
};
//  ------------------------ END UTILITY METHODS   ----------------------

//  ------------------------ BEGIN PUBLIC METHODS  ----------------------
checkType    = function ( obj_type ) {
  if ( ! objTypeMap[ obj_type ] ) {
    return ({ error_msg : 'Object type "' + obj_type
      + '" is not supported.'
    });
  }
  return null;
};

constructObj = function ( obj_type, obj_map, callback ) {
  var type_check_map = checkType( obj_type );
  if ( type_check_map ) {
    callback( type_check_map );
    return;
  }

  checkSchema(
    obj_type, obj_map,
    function ( error_list ) {
      if ( error_list.length === 0 ) {
        MongoClient.connect(url, function(err, db) {
          if (err)  { throw err; }
          db.collection( obj_type )
            .insertOne( obj_map, function( inner_error, result_map ) {
              console.log( 'crud checkSchema');
              console.log( result_map );
              callback( result_map.ops );
              db.close();
              });
        });
      }
      else {
        callback({
          error_msg   : 'Input document not valid',
          error_list  : error_list
        });
      }
    }
  );
};
readObj      = function ( obj_type, find_map, fields_map, callback ) {
  var type_check_map = checkType( obj_type );
  if ( type_check_map ) {
    callback( type_check_map );
    return;
  }
  MongoClient.connect(url, function(err, db) {
    if (err) { throw err; }

    db.collection( obj_type )
      .find( find_map, fields_map )
      .toArray( function( inner_error, map_list ) {
        callback( map_list );
        db.close();
     });
  });
};

updateObj    = function ( obj_type, find_map, set_map, callback ) {
  var type_check_map = checkType( obj_type );
  if ( type_check_map ) {
    callback( type_check_map );
    return;
  }

  checkSchema(
    obj_type, set_map,
    function ( error_list ) {
      if ( error_list.length === 0 ) {
        MongoClient.connect( url, function(err, db) {
          if (err) { throw err; }

          db.collection( obj_type )
            .updateMany( find_map, { $set: set_map },
              function( inner_error, update_count ) {
                callback({ update_count: update_count } );
                db.close();
              }
            );
        });
      }
      else {
        callback({
          error_msg   : 'Input document not valid',
          error_list  : error_list
        });
      }
    }
  );
};

destroyObj   = function ( obj_type, find_map, callback ) {
  var type_check_map = checkType( obj_type );
  if ( type_check_map ) {
    callback( type_check_map );
    return;
  }
  MongoClient.connect( url, function(err, db) {
    if (err) { throw err; }

    db.collection( obj_type )
      .deleteMany( find_map,
        function( inner_error, delete_count ) {
          callback( { delete_count: delete_count } );
          db.close();
        });
  });
};

module.exports = {
  makeMongoId : makeMongoId,
  checkType   : checkType,
  construct   : constructObj,
  read        : readObj,
  update      : updateObj,
  destroy     : destroyObj
};
  //  ------------------------ END PUBLIC METHODS -----------------------

  //  ------------------------ BEGIN MODULE INITIALIZATION --------------
  console.log( '** Connected to MongoDB **');
  clearIsOnline();

  // load schemas into memory (objTypeMap)
  (function () {
    var schema_name, schema_path;
    for ( schema_name in objTypeMap ) {
      if ( objTypeMap.hasOwnProperty( schema_name ) ) {
        schema_path = __dirname + '/' + schema_name + '.json';
        loadSchema( schema_name, schema_path );
      }
    }
  } () );
  //  ------------------------ END MODULE INITIALIZATION   --------------
