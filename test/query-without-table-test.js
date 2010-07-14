var sys = require('sys');
var vows = require('vows');
var assert = require('assert');

var mysql = require('../lib/mysql');
var helper = require('./helper');

var connection = helper.connection();
connection.connect();

function assertFields(expected) {
	return function(result) {
		var fields = result.fields;
		assert.length(fields, expected.length);
	
		fields.forEach(function(field, index) {
			assert.equal(field.type.name, expected[index].type);
			assert.equal(field.name, expected[index].name);

			assert.equal(field.db, '');
			assert.equal(field.org_name, '');
			assert.equal(field.table, '');
			assert.equal(field.org_table, '');
		});
	};
}

function assertData(expected) {
	return function(result) {
		var data = result.records[0];
		assert.length(data, expected.length);
		data.forEach(function(value, index) {
			assert.strictEqual(value, expected[index]);
		});
	};
}

function assertHash(expected) {
	return function (result) {
		var data = result.toHash(result.records[0]);
		assert.deepEqual(data, expected);
	};
}

function isCorrect(fields, data, hash) {
	var context = {
		topic : function() {
			return helper.query(connection, this.context.name);
		}
	};

	if (fields) {
		var desc = [];
		fields.forEach(function(value) {
			desc.push(value.name + " " + value.type);
		});

		context['field description is ' + desc.join(', ')] = assertFields(fields);
	}
	if (data) context['data is correct'] = assertData(data);
	if (hash) context['hash is correct'] = assertHash(hash);

	return context;
}

var batch = {
	'SELECT NULL' : isCorrect(
		[ { type: 'NULL', name: 'NULL' } ],
		[ null ]
	),

	'SELECT 2 * 5 AS ten' : isCorrect(
		[ { type: 'LONGLONG', name: 'ten' } ],
		[ 10 ]
	),

	'SELECT true, false' : isCorrect(
		[
		 	{ type: 'LONGLONG', name: 'TRUE' },
		 	{ type: 'LONGLONG', name: 'FALSE' }
		],
		[ 1, 0 ]
	),

	'SELECT 3.1415 AS pi' : isCorrect(
		[ { type: 'NEWDECIMAL', name: 'pi' } ],
		[ 3.1415 ],
		{ 'pi': 3.1415 }
	),

	'SELECT "Hello" AS greeting' : isCorrect(
		[ { type: 'VAR_STRING', name: 'greeting' } ],
		[ 'Hello' ]
	),

	'SELECT NOW()' : isCorrect(
		[ { type: 'DATETIME', name: 'NOW()' } ]
	),

	'SELECT FROM_UNIXTIME(0x7fffffff) AS end_of_times' : isCorrect(
		[ { type: 'DATETIME', name: 'end_of_times' }],
		[ new Date(0x7fffffff * 1000) ]
	),

	'SELECT TIMESTAMP("2038-01-19 03:14:04") AS end_of_times' : isCorrect(
		[ { type: 'DATETIME', name: 'end_of_times' }],
		[ new Date(0x7fffffff * 1000) ]
	)

};

vows
.describe('Query without table')
.addBatch(batch)
.addBatch(helper.connection.close(connection))
.export(module);
