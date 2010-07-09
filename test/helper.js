var events = require('events');

var mysql = require('../lib/mysql');
var config = require('./config');

function createConnection() {
	return new mysql.Connection(
			config.mysql.host,
			config.mysql.username, config.mysql.password,
			config.mysql.database, config.mysql.port);
}
exports.createConnection = createConnection;

/**
 * @param connection a MySQL connection
 * @param query SQL query to be run
 * @return EventEmitter query execution promise
 */
function createQueryPromise(connection, query) {
	var promise = new events.EventEmitter();

	connection.query(query, 
		function(result) {
			promise.emit('success', result);
		}, function(error) {
			promise.emit('error', error);
		});

	return promise;
}
exports.createQueryPromise = createQueryPromise;

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
