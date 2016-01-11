//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

//File system
var fs = require('fs');

var db_replica_set = '10.0.2.17:27017,10.0.2.18:27017,10.0.2.19:27017';
var db_local_addr = 'localhost';

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://' + db_replica_set + '/mydb';

module.exports = {
    get_requests_inprogress: function(callback) {
	MongoClient.connect(url, function (err, db) {
            if (err) {
              console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
              //HURRAY!! We are connected. :)
              //console.log('Connection established to', url);

              var collection = db.collection('Requests');

              collection.find({req_status:"started"}).toArray(function(err, results) {
                if (err) {
                  console.log(err);
                } else {
                  // Callback is the function to run w/ the results
                  callback(results);
                }
                db.close();
              });
            }
          });
    },

    update_request_status: function(req_id, request, req_status) {
	MongoClient.connect(url, function (err, db) {
	    if (err) {
		console.log('Unable to connect to the mongoDB server. Error:', err);
	    } else {
		//console.log('Connection established to', url);
	        collection = db.collection('Requests');
	        var request_info = {request: request, req_status: req_status};
		collection.update({req_id:req_id}, {$set: request_info}, {upsert: true},function(err, result) {
	            if (err) {
			console.log(err);
			console.log("Error");
	            } else {
			//console.log('Inserted: succesfully');
	            }
	            db.close();
	        });
	    }
	});
    },

    get_list_of_hospitals: function(callback){
        MongoClient.connect(url, function (err, db) {
            if (err) {
              console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
              //HURRAY!! We are connected. :)
              //console.log('Connection established to', url);

              var collection = db.collection('Hospital');

              collection.find().toArray(function(err, results) {
                if (err) {
                  console.log(err);
                } else {
                  // Callback is the function to run w/ the results
                  callback(results);
                }
                db.close();
              });
            }
          });
    },

    get_pdfs_for_user: function(username, callback){
        MongoClient.connect(url, function (err, db) {
            if (err) {
              console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
              //HURRAY!! We are connected. :)
              //console.log('Connection established to', url);

              collection = db.collection('User_Info');

			  // Exclude returning the actual file data to save bandwidth
              collection.find({username: username},{file: 0}).toArray(function(err, results) {
                if (err) {
                  console.log(err);
                } else {
                  // Callback is the function to run w/ the results
		  // 		   console.log(results);
			       callback(results);
                }
                db.close();
              }); 
            }
          });
    },

	get_pdf_by_id: function(id, callback){
        MongoClient.connect(url, function (err, db) {
            if (err) {
              console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
              //HURRAY!! We are connected. :)
              //console.log('Connection established to', url);

              collection = db.collection('User_Info');

			  var pdf_id = mongodb.ObjectID(id);
              collection.findOne({_id: pdf_id}, function(err, result) {
                if (err) {
                  console.log(err);
                } else {
                  // Callback is the function to run w/ the results
		          callback(result);
                }
                db.close();
              }); 
            }
          });
    },


    add_pdf: function(username, hospital_name, date, file_path, req_id){
        // Use connect method to connect to the Server
        MongoClient.connect(url, function (err, db) {
              if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
              } else {
                //HURRAY!! We are connected. :)
                //console.log('Connection established to', url);

                collection = db.collection('User_Info');

                fs.readFile(file_path, function (err, data) {
                  if (err) {
                    console.log(err);
                  } else {
                    var new_user_info = {username: username, hospital_name: hospital_name, date: date, file: data};
                    collection.update({req_id:req_id}, {$set: new_user_info}, {upsert: true}, function(err, result) {
                      if (err) {
                        console.log(err);
                        console.log("Error");
                      } else {
                   //     console.log('Inserted: ', result);
                      }
                      db.close();
                    });
                  }
                });
              }
            });
    }
}
