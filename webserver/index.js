var express = require('express'),
    http = require('http'),
    redis = require('redis');

var router = express();

var directory = require('cassandra-driver');
console.log('Creating a directory client');
var directoryclient = new cassandra.Client({contactPoints: ['127.0.0.1'], keyspace: 'demo'});
directoryclient.connect(function (err) {
  assert.ifError(err);
});

// To DO:
const query = "SELECT name, email, birthdate FROM users WHERE key = 'mick-jagger'";

router.get('/', directoryclient.execute(query, function (err, result) {
  var user = result.first();
  //The row is an Object with column names as property keys. 
  console.log('My name is %s and my email is %s', user.name, user.email);
}));


