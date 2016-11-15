var express = require('express'),
	app = express(),
    http = require('http'),
    redis = require('redis');

var redis_client =  redis.createClient(6379);
redis_client.on('connect', function() {
    console.log('Redis connected');
});

// When directory uploads a picture to Store,
// Store sends Cache /pId/vId/offset/datalength
app.post('/:pId/:vId/:offset/:datalength', function (req, res) {
  	var pId = req.params.pId;
    var vId = req.params.vId; 
    var offset = req.params.offset;
    var datalength = req.params.datalength; 
  
	redis_client.hmset(pid+' meta', {
		'pId': pId,
		'vId': vId,
		'offset': offset,
		'datalength': datalength
	});

});

app.get('/mid/:mId/vid/:vId/pid/:pId', function (req, response) {
	var mId = req.params.mId;
  	var vId = req.params.vId;
    var pId = req.params.pId; 
  
  	redis_client.get(pId+' photo', function(err, reply) {
	    if (reply) {
		    response.setHeader('Content-Type', 'image/jpeg');
			response.end(new Buffer(reply, 'base64'));
	    } else {
	        redis_client.hgetall(pId + ' meta', function(err, object) {
			    console.log(object);
				// Build the post string from an object
				var post_data = querystring.stringify({
				     'vid': '' + object.vId,
				     'offset': '' + object.offset,
					 'datalength': '' + object.datalength
                });

                // An object of options to indicate where to post to
                var post_options = {
                    host: '172.18.0.3',
                    port: 8080,
                    path: '/' + vId + '/' + offset + '/' + datalength,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(postData)
                    }
                };

                // Set up the request
                var post_req = http.request(post_options, function(res) {
                    res.setEncoding('utf8');
                    var body = new Stream();
                    res.on('data', function (chunk) {
                        body.push(chunk);
                    });
                    res.on('end', function () {
                        console.log('No more data in response.');
                        response.setHeader('Content-Type', 'image/jpeg');
                        response.end(new Buffer(body, 'base64'));
                    });
                });
                post_req.on('error', function(e) {
                    console.log('problem with request: ' + e.message);
                });
                // post the data
                post_req.write(post_data);
                post_req.end();
                req.end();
			});
			// encode into base64
			redis_client.setex(pId+' photo', 60, new Buffer(body).toString('base64'));
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

http.createServer(app).listen(8080, function() {
  console.log('Listening on port ' + 8080);
});
