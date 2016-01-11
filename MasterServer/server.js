var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require("request");
var http = require("http");
var util = require('./masterutils.js');
var db = require('../Database/db_util.js');

var log4js = require('log4js'); 
//console log is loaded by default, so you won't normally need to do this
//log4js.loadAppender('console');
log4js.loadAppender('file');
//log4js.addAppender(log4js.appenders.console());
log4js.addAppender(log4js.appenders.file('logs/master.log'), 'master');

var logger = log4js.getLogger('master');

MASTER_PORT = 8080
var workers = [8081, 8082]
LOCAL_HOST = '127.0.0.1'

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.post('/api/scrape', function(req, res){
  console.log("Scraping in Master Server")
  util.processRequest(req);
  res.send("Scraping in Progress");
});

// Heartbeat response
app.get('/ping', function(req, res){
	res.status(200).send("pong!");
});

app.post('/failover', function(req, res){
	var current_status = req.body.current_status;
	console.log("Primary worker crashed...");
	console.log("I am now: " + current_status);
	res.status(200).send("recieved failover message!");
	if (current_status == 'primary_master') {
		logger.info('I am now master... retrying requests from request log');
		// Get all the requests still in progress from the old master and retry
		db.get_requests_inprogress(function(data) {
			if (data.length > 0) {
				console.log("retrying unfinished requests from the request log...");
			} else {
				console.log("no requests to retry from the request log...");
			}
			for (i=0;i<data.length;i++) {	
				var r = data[i].request;
				var req_id = data[i].req_id;
				util.scrapeInformationForHospital(r.username, r.password, r.hospital, r.user_username, req_id);
			}
		});
	}
});

app.listen(MASTER_PORT);
console.log("Listening on PORT: " + MASTER_PORT);
var dispatcher = require('httpdispatcher');
