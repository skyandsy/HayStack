var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer({dest:'tmp/'});
var crypto = require('crypto');

const HTTPPORT = 8080;
const CASSANDRAPORT = 9042;
const CASSANDRAIP = '127.0.0.1';
const STOREIP = '172.18.0.3:8080';
const REDISIP = '172.18.0.2:8080';
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

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));

// Show page
app.get('/index.htm', function(req, res){
	res.sendFile(__dirname+'/'+'index.htm');
});

// Request to show a picture by picture name
app.get('/pic_show', function(req, res){
	console.log('Getting a picture...');
	console.log(req);
	console.log('Get logical volume id...');
	var pid = crypto.createHash('md5').update(req.query.pic_name).digest('hex');
	models.instance.Picmap.findOne({keyID: pid}, function(err, pic){
		if (err) throw err;
		console.log('Picture name: %s, logVol: %s.', 
			req.query.pic_name, pic.logVol);
		models.instance.Volmap.findOne({logVol: pic.logVol}, function(err, vol){
			if (err) throw err;
			console.log('phyVol: %s.', vol.phyVol);

			// Build new URL and redirect
			var url = 'http://'+vol.phyVol+'/get/:'+1+'/:'+pic.logVol+'/:'+pid;
			console.log('Redirect to %s.', url);
		});
	});

	res.end('GET succeed!');
});

// Request to delete a picture by picture name
app.get('/pic_delete', function(req, res){
	console.log('Deleting a picture');
	console.log(req);
        console.log('Get logical volume id...');
        var pid = crypto.createHash('md5').update(req.query.pic_name).digest('hex');
        models.instance.Picmap.findOne({keyID: pid}, function(err, pic){
                if (err) throw err;
                console.log('Picture name: %s, logVol: %s.',
                        req.query.pic_name, pic.logVol);
                models.instance.Volmap.findOne({logVol: pic.logVol}, function(err, vol){
                        if (err) throw err;
                        console.log('phyVol: %s.', vol.phyVol);

                        // Build new URL and redirect
                        var url = 'http://'+vol.phyVol+'/delete/:'+1+'/:'+pic.logVol+'/:'+pid;
                        console.log('Redirect to %s.', url);
                });
        });

	res.end('DELETE succeed!');
});

// Request to upload a picture
app.post('/pic_upload', upload.single('pic_name'), function(req, res){
	console.log('Uploading a picture...');

	var pid = crypto.createHash('md5').update(req.file.originalname).digest('hex');

	console.log('Finding a writen-enable volume...');
	models.instance.Volmap.findOne({empSize: {'$gte': req.file.size}},
		{allow_filtering: true}, function(err, vol){
		if (err) throw err;
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

		//Build new URL...
		var url = 'http://'+vol.logVol+'/upload';
		console.log('Redirect to %s.', url);		
	});

	res.end('UPLOAD succeed!');
});

var server = app.listen(HTTPPORT, function(){
	var host = server.address().address;
	var port = server.address().port;
	console.log('Server listening at http://%s:%s', host, port);
});
