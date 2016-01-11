var express = require('express');
var app = express();
var request = require("request");
//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');
var bodyParser = require('body-parser');
var Nightmare = require('nightmare');
var fs = require('fs');
var vo = require('vo');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var unzip = require('unzip');
var db = require('../Database/db_util.js');

var log4js = require('log4js'); 
//console log is loaded by default, so you won't normally need to do this
//log4js.loadAppender('console');
log4js.loadAppender('file');
//log4js.addAppender(log4js.appenders.console());
log4js.addAppender(log4js.appenders.file('logs/worker.log'), 'worker');
var logger = log4js.getLogger('worker');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//var worker_port = process.argv[2];
//WORKER_PORT = worker_port;
//LOCAL_HOST = 'http://localhost:';
var WORKER_PORT = 8080;

app.listen(WORKER_PORT);
console.log("Listening on port: "+WORKER_PORT);

app.get('/api/write_user', function(req, res) {
  writeDB(req, res);
});

app.post('/api/scrape', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var hospital = req.body.hospital;
  var user_username = req.body.user_username;
  var req_id = req.body.request_id;
  //console.log("username: "+username);
  //console.log("hospital: "+hospital);
  //console.log("user_username: " + user_username);

  logger.info("req_id=" + req_id + " received scrape request");

  var filepath = './' + 'TempUserInfo/'+ 'mkutsovsky' +'/'+hospital;
  if (hospital == "UPMC"){
   // console.log(hospital); 
    vo(function* () {

      var nightmare = Nightmare({ show: false });
      var scraper = yield nightmare
      .viewport(1600, 1600)
      .useragent("Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36")
      .goto("https://myupmc.upmc.com/")
      .wait()
      .type('input[name="username"]', username)
      .type('input[name="password"]', password)
      //.screenshot('screenshots/entered_info.png')
      .click('button[type="submit"]')
      .wait(1000)
      //.screenshot('screenshots/signed-in.png')
      .goto("https://myupmc.upmc.com/dashboard#!/medical_records/snapshot")
      .wait(1000)
      //.screenshot('screenshots/medical_record.png')
      .goto("https://myupmcdatatile.upmc.com/inside.asp?mode=downloadsummary#")
      .wait(500)
      //.screenshot('screenshots/download.png')
      .wait(100)
      //.screenshot('screenshots/clicked_download.png')
      .wait(100)
      .evaluate(function () {
	console.log("fetching pdf from website...");
        var data = []
        var params = "";
        params += "sec_token=" + document.getElementsByName('sec_token')[0].value + "&";
        params += "downloadcookie=" + document.getElementById('downloadcookie').value + "&"; 
        params += "doencrypt=" + document.getElementById('doencrypt').value + "&";
        params += "encryptionlevel=" + document.getElementById('weak').value;
        var cookie =  document.cookie;
        var xhr = new XMLHttpRequest();
        xhr.open("POST", 'https://myupmcdatatile.upmc.com/inside.asp?mode=download&fromlistpage=', false);
        xhr.overrideMimeType("text/plain; charset=x-user-defined");
        xhr.setRequestHeader('Cookie', cookie);
        xhr.send(params);
        data.push(xhr.responseText);
        return data;
      });
      yield nightmare.end();
      return scraper;
    })(function(err, data){
	//if (err) return console.log(err);
        //  console.log("Params = " + data);
         var filename = filepath + '.zip';
         var fs = require('fs');
         fs.writeFileSync(filename, data, "binary");

         fs.createReadStream(filename).pipe(unzip.Extract({ path: filepath }));
         db.add_pdf(user_username, hospital, new Date() , filepath+ '/\! My Health Summary.pdf', req_id);
	  logger.info("req_id=" + req_id + " finished scrape request"); 
	res.status(200).send("Finished scraping!");  
    });
  }

  //var pdf_json = extractAccountPDF(filepath+ '.zip',filepath, 'UPMC');
 // db.get_pdfs_for_user('mkutsovsky', function(results){
  //        console.log(results);
   //      });
});

