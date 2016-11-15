var express = require('express'),
	app = express(),
    http = require('http'),
    redis = require('redis');

var redis_client =  redis.createClient('127.0.0.1:6379');
redis_client.on('connect', function() {
    console.log('Redis connected');
});

app.get('/:mId/:vId/:pId', function (req, res) {
	var mId = req.params.mId;
  	var vId = req.params.vId;
    var pId = req.params.pId; 
  
  	redis_client.get(pId, function(err, reply) {
	    if (reply) {
	        console.log('%s exists', key);
		    res.setHeader('Content-Type', 'image/jpeg');
			res.end(new Buffer(reply, 'base64'));
	    } else {
	        console.log('%s doesn\'t exist', key);
			var options = {
			  host: '172.18.0.3',
			  port: 6574,
			  path: '/'+vId+'/'+pId,
			  method: 'GET'
			};

			http.request(options, function(res) {
			  var body = new Stream();
			  res.on('data', function (chunk) {
			    body.push(chunk);
			  });
			  res.on('end', function () {
				    console.log('No more data in response.');
					res.setHeader('Content-Type', 'image/jpeg');
					res.end(new Buffer(body, 'base64'));
			  });
			  req.on('error', function(e) {
				  console.log('problem with request: ' + e.message);
			  });
			});
			
			req.end();
			// encode into base64
			redis_client.setex(pId, 60, new Buffer(body).toString('base64'));
	    }
	});
});

app.delete('/:mId/:vId/:pId', function (req, res) {
	var mId = req.params.mId;
  	var vId = req.params.vId;
    var pId = req.params.pId; 
  
  	redis_client.del(pId, function(err, reply) {	    
		console.log(reply);
	});
});

http.createServer(router).listen(8080, function() {
  console.log('Listening on port ' + port);
});