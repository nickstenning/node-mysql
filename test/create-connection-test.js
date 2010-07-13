var vows = require('vows');
var events = require('events');
var sys = require('sys');
var assert = require('assert');

var mysql = require('../lib/mysql');
var helper = require('./helper');

vows.describe('Create connection').addBatch({
	'with proper credentials' : {
		topic : function() {
			var promise = new events.EventEmitter();
			var connection = helper.connection();
			connection.connect(function() {
				promise.emit('success', connection);
			});

			return promise;
		},

		'connection is successfull' : {
			topic : function(connection) {
				assert.isTrue(connection.active);
				connection.addListener('close', this.callback);
				connection.close();
			},

			'and could be closed' : function() {
//				assert.isFalse(connection, active);
			}
		}
	}
}).addBatch({
	'connection with invalid password' : helper.connection.shouldFail({ password: 'this-is-invalid-password' }, function(error) {
		assert.instanceOf(error, mysql.errors.ServerError);
		assert.equal(error.error_name, 'ER_ACCESS_DENIED_ERROR');
	}), 
	'connection on invalid port' : helper.connection.shouldFail({ port: 33333 }, function(error) {
		assert.instanceOf(error, mysql.errors.ClientError);
		assert.match(error.message, /^Connection error/);

		assert.instanceOf(error.reason, Error);
		assert.match(error.reason.message, /^ECONNREFUSED/);
	}),
	'connection with empty password' : helper.connection.shouldFail({ password: '' }),
	'connection with null password' : helper.connection.shouldFail({ password: null })
}).export(module);
