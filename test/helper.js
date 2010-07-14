var events = require('events');
var mysql = require('../lib/mysql');

var defaultConfig = {
	hostname : '127.0.0.1',
	port : 3306,

	username : 'nodejs_mysql',
	password : 'nodejs_mysql',
	database : 'nodejs_mysql'
};

var connection = function(config) {
	function merge(obj1, obj2) {
		var ret = {};
		for (var property in obj1) ret[property] = obj1[property];
		for (var property in obj2) ret[property] = obj2[property];
		return ret;
	}

	config = merge(defaultConfig, config); 

	return new mysql.Connection(
			config.host,
			config.username, config.password,
			config.database,
			config.port);
};

connection.shouldFail = function(config, assertions) {
	return {
		topic : function() {
			var promise = new events.EventEmitter();
			var conn = connection(config);
			conn.connect();
			conn.addListener('error', function(error) {
				promise.emit('success', error);
			});

			// Just in case...
			conn.close();

			return promise;
		},
		'should fail' : function(error) {
			if (typeof assertions != 'undefined') {
				assertions(error);
			}
		}
	};
};
exports.connection = connection;

/**
 * @param connection a MySQL connection
 * @param query SQL query to be run
 * @return EventEmitter query execution promise
 */
exports.query = function(connection, query) {
	var promise = new events.EventEmitter();

	connection.query(query, 
		function(result) {
			promise.emit('success', result);
		}, function(error) {
			promise.emit('error', error);
		});

	return promise;
};
exports.createQueryPromise = exports.query;

function connectionCloseBatch(connection) {
	return {
		'after test' : {
			'connection is closed' : function() {
				connection.close();
			}
		}
	};
}
exports.connectionCloseBatch = connectionCloseBatch;
connection.close = connectionCloseBatch;
