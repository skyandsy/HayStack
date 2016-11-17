var express = require('express');
var app = express();
var http = require('http');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer({dest:'tmp/'});
var crypto = require('crypto');
var fs = require('fs');

const LISTENPORT = 8080;
const REDISPORT = 8080;
const STOREPORT = 8080;
const CASSANDRAPORT = 9042;
const CASSANDRAIP = '127.0.0.1';
const STOREIP = '172.18.0.13';
const REDISIP = '172.18.0.12';
const VOLSIZE = 1048576;

// Create cassandra client
console.log('Creating a cassandra client...');
var cassandra = require('express-cassandra');
var models = cassandra.createClient({
        clientOptions: {
                contactPoints: [CASSANDRAIP],
                protocolOptions: { port: CASSANDRAPORT},
                keyspace: 'mykeyspace',
                queryOptions: {consistency: cassandra.consistencies.one}
        },
        ormOptions: {
                defaultReplicationStrategy: {
                        class: 'SimpleStrategy',
                        replication_factor: 1
                },
                migration: 'safe',
                createKeyspace: true
        }
});

console.log('Creating Volmap schema...');
var UserModel = models.loadSchema('Volmap', {
        fields: {
                logVol : 'int',
                phyVol : 'varchar',
                empSize : 'int'
        },
        key: ['logVol']
}, function(err){
        console.log(models.instance.Volmap);
        console.log(models.instance.Volmap == UserModel);
});

console.log('Creating Picmap schema...');
var UserModel = models.loadSchema('Picmap', {
        fields: {
		keyID  : 'varchar',
                logVol : 'int',
        },
        key: ['keyID']
}, function(err){
        console.log(models.instance.Picmap);
        console.log(models.instance.Picmap == UserModel);
});

console.log('Connecting to cassandra...');
models.connect(function(err){
	if (err) throw err;
	else console.log('Successfully connecting to cassandra...');
});

setTimeout(function(){
// Create mapping table: logical volume <-> physical volume
console.log('Creating logical volume <-> physical volume...');
var entry = new models.instance.Volmap({
	logVol : 1, phyVol : STOREIP, empSize : VOLSIZE
});
entry.save(function(err){
	if (err) console.log(err.message);
	else console.log('Insert to Volmap: logVol:1, phyVol:%s, empSize:%s', 
		STOREIP, VOLSIZE);
});
var entry = new models.instance.Volmap({
        logVol : 2, phyVol : STOREIP, empSize : VOLSIZE
});
entry.save(function(err){
        if (err) console.log(err.message);
        else console.log('Insert to Volmap: logVol:2, phyVol:%s, empSize:%s',
		STOREIP, VOLSIZE);
});
console.log('Finishing cassandra table initializatoin...');
}, 10000);


app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));

function imageType(name){
	var arr = name.split('.');
	return arr[arr.length-1];
}

// Show page
app.get('/index.htm', function(req, res){
	res.sendFile(__dirname+'/'+'index.htm');
});

// Request to show a picture by picture name
app.get('/pic_show', function(req, res){
	console.log('Getting a picture...');
	console.log(req);

	var pname = req.query.pic_name;
	var pid = crypto.createHash('md5').update(req.query.pic_name).digest('hex');

	console.log('Get logical volume id...');
	models.instance.Picmap.findOne({keyID: pid}, function(err, pic){
		if (err) throw err;

		if (typeof pic == 'undefined'){
			console.log('Picture does not exist!');
			res.end('Picture does not exist!');
		} else {
			console.log('Picture name: %s, logVol: %s.', 
				req.query.pic_name, pic.logVol);
			models.instance.Volmap.findOne({logVol: pic.logVol}, function(err, vol){
				if (err) throw err;
				console.log('phyVol: %s.', vol.phyVol);

				// Connect with redis server
				console.log('Get the picture from REDIS server...');
				var options = {
					port: REDISPORT,
					hostname: REDISIP,
					method: 'GET',
					path: '/1/'+pic.logVol+'/'+pid
				};

				var getReq = http.request(options, function(response){
					console.log('STATUS: ${response.statusCode}$');
					console.log('HEADER: ${JSON.stringify(response.headers)}$');

					response.setEncoding('utf8');
					response.on('data', function(chunk) {
						console.log('Response: '+chunk);
						res.writeHead(200, {'Content-Type': 'text/html'});
						res.end("<html><body>"+
							"<img src =\"data:image/"+imageType(pname)+
							";base64,"+chunk+"\"/>"+
							"</body></html>");
					});
					response.on('end', function(){
						console.log('No more data in response.');
					});
				});

				getReq.on('error', function(err){
					console.log('GET REQUEST ERROR: ${err.message}$');
				});

				getReq.end();
			});
		}
	});
});

// Request to delete a picture by picture name
app.get('/pic_delete', function(req, res){
	console.log('Deleting a picture');
	console.log(req);
        console.log('Get logical volume id...');

        var pid = crypto.createHash('md5').update(req.query.pic_name).digest('hex');
        
	models.instance.Picmap.findOne({keyID: pid}, function(err, pic){
                if (err) throw err;

		if (typeof pic == 'undefined'){
                        console.log('Picture does not exist!');
                        res.end('Picture does not exist!');
                } else {
                	console.log('Picture name: %s, logVol: %s.',
                        	req.query.pic_name, pic.logVol);

			models.instance.Picmap.delete({keyID: pid}, function(err){
				if (err) throw err;
				else console.log('Deleted the picture from directory!');
			});

                	models.instance.Volmap.findOne({logVol: pic.logVol}, function(err, vol){
                        	if (err) throw err;
                        	console.log('phyVol: %s.', vol.phyVol);

			 	// Connect with redis server
                                console.log('Deleting the picture from REDIS server...');
                                var options = {
                                        port: REDISPORT,
                                        hostname: REDISIP,
                                        method: 'DELETE',
                                        path: '/:1/:'+pic.logVol+'/:'+pid
                                };

                                var deleteReq = http.request(options, function(response){
                                        console.log('STATUS: ${response.statusCode}$');
                                        console.log('HEADER: ${JSON.stringify(response.headers)}$');

					res.end('Successfully deleted the picture!');
                                });

                                deleteReq.on('error', function(err){
                                        console.log('DELETE REQUEST ERROR: ${err.message}$');
                                });

                                deleteReq.end();
                	});
		}
        });
});

// Request to upload a picture
app.post('/pic_upload', upload.single('pic_name'), function(req, res){
	console.log('Uploading a picture...');
	console.log(req.file);

	var pid = crypto.createHash('md5').update(req.file.originalname).digest('hex');

	console.log('Finding a writen-enable volume...');
	models.instance.Volmap.findOne({empSize: {'$gte': req.file.size}},
		{allow_filtering: true}, function(err, vol){
		if (err) throw err;

		if (vol == 'undefined'){
			console.log('Stores are full!');
			res.end('Stores are full!');
		} else {

			console.log('Store picture to volume %s.', vol.logVol);

			var newSize = vol.empSize-req.file.size;
			models.instance.Volmap.update({logVol: vol.logVol}, {empSize: newSize},function(err){
				if (err) throw err;
				else console.log('Updated Volmap: logVol: %s, empSize: %s.',
					vol.logVol, newSize);
			});
		
			var entry = new models.instance.Picmap({keyID: pid, logVol: vol.logVol});
			entry.save(function(err){
				if (err) throw err;
				else console.log('Insert to Picmap: keyID: %s, logVol: %s.',
					pid, vol.logVol);
			});

			console.log('Uploading picture to cache...')	
			var postData = fs.readFileSync('tmp/'+req.file.filename, {encoding: 'base64'});
			var options = {
				host: STOREIP,
				port: STOREPORT,
				method: 'POST',
				path: '/upload/'+pid+'/'+vol.logVol,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Content-Length': Buffer.byteLength(postData)
				}
			}

			var postReq = http.request(options, function(response){
				console.log('Upload secceed!');
				res.end('Upload secceed!');
			});

			postReq.on('error', function(err){
				throw err;
				console.log('Problem with request: '+err.message);
			});

			postReq.write(postData);
			postReq.end();
		}	
	});
});
var server = app.listen(LISTENPORT, function(){
	var host = server.address().address;
	var port = server.address().port;
	console.log('Server listening at http://%s:%s', host, port);
});
