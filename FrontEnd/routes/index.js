var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();
var db = require('../../Database/db_util.js');
var util = require('../Util.js');
var log4js = require('log4js');
var logger = log4js.getLogger('front_end');

var i = 0;

router.get('/', function (req, res) {
if(req.user){
    var un = req.user.username;
    var out_data = {username: un, pdfs:[], user:req.user};

    db.get_pdfs_for_user(un, function(data){
        out_data['pdfs'] = data;
 //       console.log('outdata=', out_data);
        return res.render("index", out_data);
    });
}else{
    return res.render('index', { user : req.user });
}
});

router.get('/register', function(req, res) {
res.render('register', { });
});

router.post('/register', function(req, res) {
Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
    if (err) {
      return res.render("register", {info: "Sorry. That username already exists. Try again."});
    }else{
        logger.info('user: ' + req.body.username + ' successfully registered.');
        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    }
});
});

router.get('/login', function(req, res) {
res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
res.redirect('/');
});

router.get('/logout', function(req, res) {
req.logout();
res.redirect('/');
});

router.get("/add_info", function(req, res){
if(req.user){
    db.get_list_of_hospitals(function(results){
        var hospitals = [];
        for(var i=0; i<results.length; i++){
            var json = {hospital_name: results[i].hospital_name};
            hospitals.push(json);
        }
        var data = {
            hospitals: hospitals,
            user: req.user
        }
 //       console.log("data = ", data);
        return res.render("add_info", data)
    });
}else{
    res.redirect('/');
}
});


router.get("/view_pdf", function(req, res){
var pdf_id = req.query.id;
// get pdf data from database
db.get_pdf_by_id(pdf_id, function(data) {
    if (data == null) {
//        console.log("no match...");
        res.redirect(404,'/')
    } else {
        res.contentType("application/pdf");
        res.send(data.file.buffer);
    }
});
});

router.post("/add_info", function(req, res){
    var un = req.body.user_username;
    util.scrapeInformationForHospital(req,i);
    i += 1;
    db.get_pdfs_for_user(un, function(data){
        var out_data = {
            pdfs: data,
            username: un,
            user: req.user
        }
        res.redirect('/');
    });
});

router.get('/ping', function(req, res){
res.status(200).send("pong!");
});

module.exports = router;
