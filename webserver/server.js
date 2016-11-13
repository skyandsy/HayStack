var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer({dest:'tmp/'});
var assert = require('assert');

const HTTPPORT = 8080;

// Create cassandra client
var cassandra = require('cassandra-driver');
console.log('Creating a directory cassandra client...');
var cassandraClient = new cassandra.Client({ contactPoints: ['127.0.0.1']});
cassandraClient.connect(function(err, result){
    console.log('Cassandra client connected...');
});

// Create mapping table
// TODO

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));

// TODO: register store
app.get('/register', function(req, res){
	res.end('Register success!');
});

// Show page
app.get('/index.htm', function(req, res){
	res.sendFile(__dirname+'/'+'index.htm');
});

// Request to show a picture by picture name
app.get('/pic_show', function(req, res){
	// TODO: 
	console.log('Get logical volume id...');
	var selectQuery = 'SELECT * FROM test_keyspace.test_table';
        cassandraClient.execute(selectQuery, [], function(err, result) {
        	console.log('Volume id = ');
        	var first = result.rows[0];
        	console.log('id %s value %s', first.id, first.test_value);
   	});

	//TODO: Build new URL and redirect
	console.log('Redirect to ...');
	res.writeHead(301,
	{Location: 'http://172.18.0.3:8080/+url'}
	);
	res.end();
});

// Request to delete a picture by picture name
app.get('/pic_delete', function(req, res){
	// TODO: 
        console.log('Get logical volume id...');
        var selectQuery = 'SELECT * FROM test_keyspace.test_table';
        cassandraClient.execute(selectQuery, [], function(err, result) {
                console.log('Volume id = ');
                var first = result.rows[0];
                console.log('id %s value %s', first.id, first.test_value);
        });

        //TODO: Build new URL and redirect
        console.log('Redirect to ...');
        res.writeHead(301,
        {Location: 'http://127.0.0.1:8080/index.htm'}
        );

});

// Request to upload a picture
app.post('/pic_upload', upload.single('pic_name'), function(req, res){
	console.log(req.file);

	// TODO: find write-enabled volue

	console.log('Insert new entry for the uploaded picture...');
	const insertQuery = 'INSERT INTO test_table (id, test_value) VALUES (?, ?)';
    	cassandraClient.execute(insertQuery, 
		[req.params.id, req.params.value], function(err, result){
            	if(err){
                	res.status(404).send({msg: err});
            	} else{
               		var first = result.rows[0]
               		console.log('id %s value %s', first.id, first.test_value);
            	}
        });
	

	// TODO: build new post request
	var file = __dirname+'/'+req.file.name;
	response = {
		message:'File uploaded successfully!',
		pic_name:req.file.originalname
	};
	console.log(response);
	res.end(JSON.stringify(response));
});

var server = app.listen(HTTPPORT, function(){
	var host = server.address().address;
	var port = server.address().port;
	console.log('Server listening at http://%s:%s', host, port);
});
