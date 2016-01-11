var request = require('request');
var bodyParser = require('body-parser');
var db = require('../Database/db_util.js');
var log4js = require('log4js');
var logger = log4js.getLogger('front_end');

var master_ip_addr = '10.0.2.45';
var master_port = '80';

module.exports = {
	createCreateUserRequest: function (req) {
		//console.log("New user create request:");
		var uname = req.body.username;
		var upass = req.body.userpwd;
		//console.log("username: " + uname);
		//console.log("password: " + upass);

		var sendingTo = "http://localhost:3000";

		request.post(
			(sendingTo + '/created'),
			{json: {username: uname, password: upass}},
			function (err, resp, body){
				if(!err && resp.statusCode == 200){
					//console.log(body);
				}
			}
		);
	},

	testCreated: function(req) {
		//console.log("New user created!!:");
		var un = req.body.username;
		var up = req.body.password;
		db.create_user(un, up);
		//console.log(req.body.username);
		//console.log(req.body.password);
	},

	testLogin: function(req, res) {
		var un = req.body.username;
		var up = req.body.password;
		db.get_user_account_info(un, function(data){
			if(data){
				if(data.password === up){
					db.get_pdfs_for_user(un, function(data){
						var out_data = {
							pdfs: data,
							username: un
						}
						res.render("account_home", out_data);
					});
				}
			}else{
				res.render("login");
			}
		});
	},

	scrapeInformationForHospital: function(req, i) {
		//console.log("Scraping Information for Hospital:");
		var username = req.body.username;
		var password = req.body.password;
		var hospital = req.body.hospital;
		var user_username = req.user.username;
		//console.log("username: "+username);
		//console.log("hospital: "+hospital);
		//console.log("user username: " + req.user.username);

		logger.info('req_id=' + i + ' front_end request');
		var sendingTo = 'http://' + master_ip_addr + ':' + master_port + '/api/scrape';
		//console.log("Sending to: " + sendingTo);		
                request.post({
			url: sendingTo,
			form: {username: username, password: password, hospital:hospital, user_username: user_username, request_id: i}
		}, function (err, resp, body){
		//		console.log(body);
		});
	},

	testScrapeInformationForHospital: function(req, i) {
		//console.log("Scraping Information for Hospital:");
		var username = req.body.username;
		var password = req.body.password;
		var hospital = req.body.hospital;
		var user_username = req.user.username;
		//console.log("username: "+username);
		//console.log("hospital: "+hospital);
		//console.log("user username: " + req.user.username);

		logger.info('req_id=' + i + ' front_end request');
		var sendingTo = 'http://' + master_ip_addr + ':' + master_port + '/api/scrape';
		//console.log("Sending to: " + sendingTo);		
                request.post({
			url: sendingTo,
			form: {username: username, password: password, hospital:hospital, user_username: user_username, request_id: i}
		}, function (err, resp, body){
	///			console.log(body);
		});
	}
}
