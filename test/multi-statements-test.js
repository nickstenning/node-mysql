var sys = require('sys');
var vows = require('vows');
var assert = require('assert');
var events = require('events');

var mysql = require('../lib/mysql');
var helper = require('./helper');

function testSimpleStatement() {
	return {
		topic : function(env) {
			var connection = env[0];
			return helper.query(connection, 'SELECT 1'); 
		},
		'should succeed' : function(result) {
			assert.length(result.records, 1);
			assert.equal(result.records[0][0], 1);
		},
		'should have only one result' : function() {
			var connection = this.context.topics[1][0];
			assert.isFalse(connection.has_more_results());
		}
	};
}

var batch = {
	'When multi statements are NOT enabled,' : {
		topic : function() {
			var connection = helper.connection();
			connection.connect();
			return [ connection ];
		},
		
		'simple statement' : testSimpleStatement(),

		'multi-statement' : {
			topic : function(env) {
				var connection = env[0];
				return helper.query.fail(connection, 'SELECT 1; SELECT 2;');
			},
			'should fail' : function(error) {
				var connection = this.context.topics[1][0];

				assert.instanceOf(error, mysql.errors.ServerError);
			}
		},

		'after all tests' : {
			topic : function(env) {
				var connection = env[0];
				setTimeout(function () { connection.close(); }, 200);
				return true;
			},
			'connection should be closed' : function(result) {}
		}
	},

	'When multi-statements are enabled' : {
		topic : function() {
			var connection = helper.connection();
			connection.connect();
			connection.set_server_option(mysql.constants.option.MULTI_STATEMENTS_ON);

			return [ connection ];
		},
	
		'simple statement' : {
			topic : function(env) {
				var connection = env[0];
				return helper.query(connection, 'SELECT 1'); 
			},
			'should succeed' : function(result) {
				assert.length(result.records, 1);
				assert.equal(result.records[0][0], 1);
			},
			'should have only one result' : function() {
				var connection = this.context.topics[1][0];
				assert.isFalse(connection.has_more_results());
			}
		},

		'multi-statement' : {
			topic : function(env) {
				var connection = env[0];
				return helper.query(connection, 'SELECT 1; SELECT 2'); 
			},
			'should return result of first statement' : function(result) {
				assert.length(result.records, 1);
				assert.equal(result.records[0][0], 1);
			},
			'should have more results' : function(result) {
				var connection = this.context.topics[1][0];
				assert.isTrue(connection.has_more_results());
			}
		},

		'after all tests' : {
			topic : function(env) {
				var connection = env[0];
				setTimeout(function () { connection.close(); }, 200);
				return true;
			},
			'connection should be closed' : function(result) {}
		}
	}
};

vows.describe('Multi statements')
.addBatch(batch)
//.addBatch()
.export(module);
