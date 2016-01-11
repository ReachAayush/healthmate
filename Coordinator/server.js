var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require("request");
var http = require("http");
var httpProxy = require('http-proxy');
MASTER_PORT = 8080
var workers = [8081, 8082]
LOCAL_HOST = '127.0.0.1'

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

var primary_master = '10.0.2.45';
var backup_masters = ['10.0.2.132','10.0.2.133'];

// Create Proxy server to primary Master
var proxy = httpProxy.createProxyServer({target:'http://' + primary_master}).listen(MASTER_PORT);

proxy.on('proxyReq', function(proxyReq, req, res, options) {
	console.log('sending to primary master at ip:' + primary_master + '...');
});

var healthCheckInterval = setInterval(function() {
	request({
		url: 'http://' + primary_master + '/ping',
		method: 'GET',
		timeout: 4000
	}, function (err, resp, body) {
		if (err) {
			console.log('error...');
		} else {
			console.log('response... ' + resp.statusCode);
		}
	}).on('error', function (err) {
		if (backup_masters.length == 0) {
			console.log('No master servers left...');
			proxy.close();
			clearInterval(healthCheckInterval);
		} else {
			var new_primary_index = Math.floor(Math.random()*backup_masters.length);
			primary_master = backup_masters[new_primary_index];
			backup_masters.splice(new_primary_index,1);
			console.log(err);
			console.log("Reelected new master: " + primary_master);
			console.log("backups... = " + backup_masters);
			// Switch the forwarding to the new master
			proxy.close();
			proxy = httpProxy.createProxyServer({target:'http://' + primary_master}).listen(MASTER_PORT);
			// Notify the master servers of the reelection
			notifyMasterServers(primary_master, backup_masters);
		}
	});

}, 5000)

function notifyMasterServers(new_primary, backups) {
	// Notify the new master server
	request({
                url: 'http://' + new_primary + '/failover',
                method: 'POST',
		form: {current_status: 'primary_master'},
		timeout: 4000
        }, function (err, resp, body) {
                if (err) {
                        console.log('error...');
                } else {
                        console.log('Updated master...');
                }
        });
	// Notify the backup servers
	for(i = 0; i < backups.length; i++) {
		var backup_ip = backups[i];
		request({
			url: 'http://' + backup_ip + '/failover',
			method: 'POST',
			form: {current_status: 'backup_master'},
			timeout: 4000
        	}, function (err, resp, body) {
			if (err) {
				console.log('error...');
			} else {
				console.log('Updated backup...');
			}
        	});
	}
}
