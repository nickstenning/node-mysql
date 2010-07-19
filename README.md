# node-mysql

node-mysql is a pure Javascript MySQL network driver for [node.js](http://nodejs.org/)

# Want to help?

node-mysql is currently only really suitable for testing. It has a long way to go until it's a stable MySQL adapter, and your help would be greatly appreciated!

## Tests

Tests are currently in the process of being rewritten to use [vows.js](http://vowsjs.org)

## Documentation

Originally written by [Yuichiro MASUI](http://github.com/masuidrive/), the library is currently lacking in documentation, although this is being worked on.

The API was originally modelled on  [mysql.rb](http://github.com/tmtm/ruby-mysql/blob/2.9/lib/mysql.rb). The following might be a useful reference: [tmtm's mysql library reference](http://tmtm.org/en/mysql/ruby/).

## Pool manager

Currently, this driver supports single connection only. In order to implement multiple connections, a pool manager needs to be written, which in turn requires MySQL transactions to be implemented.

# Example

    var sys = require('sys');
    var mysql = require('./lib/mysql');
    
    /*
    > mysql -u root
    CREATE DATABASE nodejs_mysql;
    GRANT ALL ON nodejs_mysql.* TO nodejs_mysql@localhost IDENTIFIED BY "nodejs_mysql";
    */
    var conn = new mysql.Connection('localhost','nodejs_mysql', 'nodejs_mysql', 'nodejs_mysql');
    conn.connect();
    conn.query("CREATE TEMPORARY TABLE test1(intval INTEGER, strval TEXT, timestampval TIMESTAMP, boolval BOOLEAN);");
    conn.query("INSERT INTO test1 VALUES(1,'a',now(),true);");
    conn.query("SELECT * FROM test1;",
        function(result) {
            for(var i=0; i<result.records.length; ++i) {
                sys.puts("Result: "+sys.inspect(result.toHash(result.records[i])));
            };
        },
        function(error) {
            sys.puts("Error: "+sys.inspect(error));
        });

See also the examples folder.

# Requirements

* [node.js](http://nodejs.org/) >= 0.1.92

# License

MIT License. See LICENSE file.

# Who wrote this?

Original code by [Yuichiro MASUI](http://github.com/masuidrive/) and contributors. For an up-to-date list see [AUTHORS](http://github.com/nickstenning/node-mysql/blob/master/AUTHORS)

# Related licenses

MySQL protocol encode/decode from tmtm's ruby-mysql.

* [http://github.com/tmtm/ruby-mysql](http://github.com/tmtm/ruby-mysql)
* Copyright: Copyright (c) 2009-2010 TOMITA Masahiro 
* License: Ruby's

Promise library

* [http://nodejs.org/](http://nodejs.org/)
* Copyright 2009, 2010 Ryan Lienhart Dahl. All rights reserved.
* License: MIT

pack/unpack from php.js

* [http://phpjs.org/functions/pack:880](http://phpjs.org/functions/pack:880)
* Author: Tim de Koning (http://www.kingsquare.nl)
* License: BSD

