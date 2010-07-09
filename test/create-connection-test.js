var vows = require('vows');
var events = require('events');
var sys = require('sys');
var assert = require('assert');
var mysql = require('../lib/mysql');

vows.describe('Create connection').addBatch({
	'with proper credentials' : {
		topic : function() {
			var promise = new events.EventEmitter();
			var connection = new mysql.Connection(
					'localhost',
					'nodejs_mysql',
					'nodejs_mysql',
					'nodejs_mysql',
					3306);
			connection.connect(function() {
				promise.emit('success', connection);
			});

			return promise;
		},

		'after connection is successfull' : {
			topic : function(connection) {
				assert.isTrue(connection.active);
				connection.addListener('close', this.callback);
				connection.close();
			},

			'connection could be closed' : function() {
//				assert.isFalse(connection, active);
			}
		}
	},
	
	'with invalid credentials' : {
		topic : function() {
			var promise = new events.EventEmitter();
			var connection = new mysql.Connection('127.0.0.1',
					'root', 'this-password-is-invalid', 'dbname');
			connection.connect(function() {
				promise.emit('error', connection);
			}, function(err) {
				// Treat error as success!
				promise.emit('success', err);
			});
			
			return promise;
		},
	
		'access should be denied' : function(err) {
			assert.instanceOf(err, mysql.errors.ServerError);
			assert.equal('ER_ACCESS_DENIED_ERROR', err.error_name);
		}
	}
}).export(module);
