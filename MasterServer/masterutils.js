var request = require('request');
var bodyParser = require('body-parser');
var db = require('../Database/db_util.js');
var http = require("http");

var log4js = require('log4js');
var logger = log4js.getLogger('master');

var WORKER_PORT = [8081, 8082]
retry_timeout = 100000;

// blah
var WORKER_PORT_AWS = '80';
var WORKER_IP_ADDR1 = '10.0.2.160'
var WORKER_IP_ADDR2 = '10.0.2.125'

module.exports = {
	processRequest: function(req) {
                var username = req.body.username;
                var password = req.body.password;
                var hospital = req.body.hospital;
                var user_username = req.body.user_username;
                var req_id = req.body.request_id;
                scrapeInformationForHospitalLocal(username, password, hospital, user_username, req_id);
        },

	scrapeInformationForHospital: function(username, password, hospital, user_username, req_id) {
		scrapeInformationForHospitalLocal(username,password,hospital,user_username,req_id);
	}
}

function scrapeInformationForHospitalLocal(username, password, hospital, user_username, req_id) {
	//console.log("Scrape Request for Hospital:");
	//console.log("username: "+username);
	//console.log("hospital: "+hospital);
	//console.log("user_username: " + user_username);

	// Add the request to the request log
	var req_contents = {username: username, password: password, hospital: hospital, user_username: user_username}
	db.update_request_status(req_id, req_contents, 'started');

	// Choose the primary worker at random		
	var default_worker = WORKER_IP_ADDR1;
	var backup_worker = WORKER_IP_ADDR2;
	var primary_index = Math.floor(Math.random()*2) + 1;
	var backup_index = 2;
	if (primary_index == 2) {
		default_worker = WORKER_IP_ADDR2;
		backup_worker = WORKER_IP_ADDR1;
		backup_index = 1;
	} 

	logger.info('req_id=' + req_id + ' worker' + primary_index + ' request');

	request({
		url: 'http://' + default_worker + ':' + WORKER_PORT_AWS + '/api/scrape',
		form: {username: username, password: password, hospital: hospital, user_username: user_username, request_id: req_id},
		method: 'POST',
		timeout: 300000
	}, function (err, res, body){
		if(err){
			console.log(err);
			logger.info('req_id=' + req_id + ' worker' + primary_index + ' response=error')
		}else{
			logger.info('req_id=' + req_id + ' worker' + primary_index + ' response=success');
			// Update request status in the request log
			db.update_request_status(req_id, {}, 'finished');
		}
	}).on('error', function(err) {
		logger.info('req_id=' + req_id + ' worker' + backup_index + ' request');
		request({
		url: 'http://' + backup_worker + ':' + WORKER_PORT_AWS + '/api/scrape',
		form: {username: username, password: password, hospital: hospital, user_username: user_username, request_id: req_id},
		method: 'POST',
		timeout: 300000
	}, function (err, res, body){
		if(err){
			console.log(err);                           
			logger.info('req_id=' + req_id + ' worker' + backup_index + ' response=error')
		}else{
			logger.info('req_id=' + req_id + ' worker' + backup_index + ' response=success');
			// Update request status in the request log
			db.update_request_status(req_id, {}, 'finished');
		}
	});
	});
}

