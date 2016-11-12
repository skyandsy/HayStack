var port = 8080;
var express = require('express');
    router = express();
    http = require('http'),
    assert = require('assert')

// Query the directory
var cassandra = require('cassandra-driver');
console.log('Creating a directory cassandra client');
var cassandra_client = new cassandra.Client({ contactPoints: ['127.0.0.1']});
cassandra_client.connect(function(err,result){
    console.log('Cassandra connected');
});

// To DO:
console.log('Get cassandra directory');
var select_query = 'SELECT * FROM test_keyspace.test_table';
router.get('/', function(req, res) {
    	cassandra_client.execute(select_query, [], function(err, result) {
        console.log('select all');
        var first = result.rows[0];
        console.log('id %s value %s', first.id, first.test_value);
    });
});

console.log('Post cassandra directory');
const insert_query = 'INSERT INTO test_table (id, test_value) VALUES (?, ?)';
router.post('/id/:id/value/:value', function(req, res){
    cassandra_client.execute(insert_query, [req.params.id, req.params.value],
        function(err, result){
            if(err){
                res.status(404).send({msg: err});
            } else{
               var first = result.rows[0]
               console.log('id %s value %s', first.id, first.test_value);
            }
        });
});

http.createServer(router).listen(port, function() {
  console.log('Listening on port ' + port);
});
