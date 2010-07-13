var vows = require('vows');
var assert = require('assert');
var events = require('events');
var sys = require('sys');

var helper = require('./helper');
var mysql = require('../lib/mysql');

var connection = helper.connection();
connection.connect();
connection.query("CREATE TEMPORARY TABLE t (id INTEGER AUTO_INCREMENT, value INTEGER, PRIMARY KEY (id))");

vows.describe('Inserting 256 rows').addBatch({
	'inserting 256 rows in a single statement' : {
		topic : function() {
			var query = [];
			for (var i = 0; i < 256; i++) {
				query.push('(' + i + ')');
			}
			query = 'INSERT INTO t(value) VALUES ' + query.join(',');

			return helper.createQueryPromise(connection, query);
		},

		'affects 256 rows' : function(result) {
			assert.equal(256, result.affected_rows);
		},
		
		'fills table' : {
			topic : function() {
				return helper.createQueryPromise(connection, "SELECT COUNT(*) FROM t");
			},
			
			'with 256 entries': function(result) {
				assert.equal(256, result.records[0][0]);
			}
		}
	}
})
.addBatch(helper.connectionCloseBatch(connection))
.export(module);
