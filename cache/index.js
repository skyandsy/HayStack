const LISTENPORT = 8080;
const STOREPORT = 8080;
const STOREIP = '172.18.0.3';//'172.18.0.3';
const PORT = 6379;
var express = require('express'),
	app = express(),
    http = require('http'),
    redis = require('redis'),
    querystring = require('querystring');

var redis_client =  redis.createClient(PORT);
redis_client.on('connect', function() {
    console.log('Redis connected');
});



// When directory uploads a picture to Store,
// Store sends Cache /pId/vId/offset/datalength
app.post('/:pId/:vId/:offset/:datalength', function (req, res) {
    console.log('Store sends Cache /pId/vId/offset/datalength');
  	var pId = req.params.pId;
    var vId = req.params.vId; 
    var offset = req.params.offset;
    var datalength = req.params.datalength; 
  
	redis_client.hmset(pId + '&meta', {
		'pId': '' + pId,
		'vId': '' + vId,
		'offset': '' + offset,
		'datalength': '' + datalength
	});

});


// Directory requests a photo from Cache /mId/vId/pId
app.get('/:mId/:vId/:pId', function (req, responseToDir) {
	var mId = req.params.mId;
  	var vId = req.params.vId;
    var pId = req.params.pId; 
  
  	redis_client.get(pId + '&photo', function(err, reply) {
	    if (reply) {
            console.log('Cache hits, found the photo');
		    responseToDir.setHeader('Content-Type', 'image/jpeg');
			responseToDir.end(new Buffer(reply, 'base64'));
	    } else {
            console.log('Cache misses, photo not found');
	        redis_client.hgetall(pId + '&meta', function(err, metadata) {
                if (err) {
                    console.log('Cache does not contain the metadata');               
                } else {
                    
                    // Build the post metadata from an object
                    // Send this metadata to Store
                    var postData = querystring.stringify({
                         'vid': '' + metadata.vId,
                         'offset': '' + metadata.offset,
                         'datalength': '' + metadata.datalength
                    });
                    console.log('Cache sends Store metadata: ' + postData);

                    
                    var post_options = {
                        host: STOREIP,
                        port: STOREPORT,
                        path: '/' + postData.vId + '/' + postData.offset + '/' + postData.datalength,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Content-Length': Buffer.byteLength(postData)
                        }
                    };

                    // Set up the request
                    var post_req = http.request(post_options, function(resFromStore) {
                        resFromStore.setEncoding('utf8');
                        var body = new Stream();
                        resFromStore.on('data', function (chunk) {
                            body.push(chunk);
                        });
                        resFromStore.on('end', function () {
                            console.log('No more data in response.');
                            responseToDir.setHeader('Content-Type', 'image/jpeg');
                            responseToDir.end(new Buffer(body, 'base64'));
                            // encode into base64
                            redis_client.setex(pId + '&photo', 60, new Buffer(body).toString('base64'));
                        });
                    });
                    post_req.on('error', function(e) {
                        console.log('problem with request: ' + e.message);
                    });
                    // post the data
                    post_req.write(postData);
                    post_req.end();
                }
			});
	    }
	});
});

app.delete('/:mId/:vId/:pId', function (req, res) {
	var mId = req.params.mId;
  	var vId = req.params.vId;
    var pId = req.params.pId; 
  
  	redis_client.del(pId + '&photo', function(err, reply) {	    
		console.log(reply);
	});
});

http.createServer(app).listen(LISTENPORT, function() {
  console.log('Listening on port ' + LISTENPORT);
});
