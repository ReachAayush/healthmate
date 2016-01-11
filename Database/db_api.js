//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');

//File system
var fs = require('fs');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

var db_ip_addr = '10.0.2.200';
var db_local_addr = 'localhost';

// Connection URL. This is where your mongodb server is running.
 var url = 'mongodb://' + db_ip_addr + ':27017/mydb';

////////////////////////// For TESTING ///////////////////////////////////////

create_user('Josh', 'josh'); //=> creates the new user account
//create_user('Misha', 'pass'); //=> user account already exists
//update_user('Misha', '1234'); //=> updates the user account w/ new password
//update_user('jimbo', '121'); => does nothing since jimbo doesn't exist 

function myTestCallback1(result) {
  if (result == null) {
    console.log("No user w/ that username exists...");
  } else {
    console.log(result);
  }
}

//get_user_account_info('Josh', myTestCallback1);

function myTestCallback2(results) {
  for (i = 0; i < results.length; i ++) {
    var binary_data = results[i].file;
    var wstream = fs.createWriteStream('./test' + i + '.pdf');
    wstream.write(binary_data.buffer);
    wstream.end();
  }
}

//add_hospital('{ "hospital_name": "UPMC", "website": "https://myupmc.upmc.com/" }');
//add_hospital('{ "hospital_name": "Swedish Medical", "website": "http://www.swedish.org/" }');
//get_list_of_hospitals(myTestCallback2);

//add_pdf("Josh", "UMPC", "03/03/2015", "./PrivacySeminarSyllabus-Fall2015.pdf");

//get_pdfs_for_user('Josh',myTestCallback2);

////////////////////////// End For TESTING ///////////////////////////////////////

// Creates a new user account w/ the given username and password
// if it doesn't already exist
// Output: Void
function create_user(new_username, new_password) {
  // Use connect method to connect to the Server
  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      //HURRAY!! We are connected. :)
      console.log('Connection established to', url);

      var collection = db.collection('User');

      var new_user = {username: new_username, password: new_password};

      // Check if the username already exists,
      // If it does not create the new user account
      collection.count({username: new_username}, function(err, count) {
        if (err) {
          console.log(err);
        } else if (count > 0) {
          console.log('User account with username: ', new_username, ' already exists...');
          db.close();
        } else {
          collection.insert(new_user, function(err, result) {
            if (err) {
              console.log(err);
            } else {
              console.log('Inserted: ', result);
            }
            db.close();
          });
        }
      });
    }
  });
}

// For now, only allow the user to change their password
// If username doesn't match, it does nothing
// Output: Void
function update_user(username, new_password) {
  // Use connect method to connect to the Server
  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      //HURRAY!! We are connected. :)
      console.log('Connection established to', url);

      var collection = db.collection('User');

      collection.update(
        { username: username},
        { 
          $set: {password: new_password}
        },
        function (err, result) {
          if (err) {
            console.log(err);
          } else {
            console.log('Updated ', result.result.nModified, ' documents');  
          }
          db.close();
        });
    }
  });
}

// Returns the user's account information for the given username
// Assuming authentication on client side????
function get_user_account_info(username, callback) {
  // Use connect method to connect to the Server
  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      //HURRAY!! We are connected. :)
      console.log('Connection established to', url);

      var collection = db.collection('User');

      // Fetch the user account
      collection.findOne({username: username}, function(err, result) {
        if (err) {
          console.log(err);
        } else {
          // Callback is the function to run w/ the results
          // result is null if the user doesn't exist
          callback(result);
        }
        db.close();
      });
    }
  });
}

//Adds Hospital Info in the collection Hospital
//Takes in: hospital_name, hospital_website as json
function add_hospital(hospital_info) {
  // Use connect method to connect to the Server
  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      //HURRAY!! We are connected. :)
      console.log('Connection established to', url);

      var collection = db.collection('Hospital');
      var json = JSON.parse(hospital_info);

      // Check if the username already exists,
      // If it does not create the new user account
      collection.count({hospital_name: json.hospital_name}, function(err, count) {
        if (err) {
          console.log(err);
        } else if (count > 0) {
          console.log('Hospital with name: ', new_username, ' already exists...');
          db.close();
        } else {
          collection.insert(json, function(err, result) {
            if (err) {
              console.log(err);
            } else {
              console.log('Added: ', result);
            }
            db.close();
          });
        }
      });
    }
  });
}

// Returns the list of hospitals in the hospital db
// Result is an array of hospitals, empty if none in db
function get_list_of_hospitals(callback) {
  // Use connect method to connect to the Server
  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      //HURRAY!! We are connected. :)
      console.log('Connection established to', url);

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
}

// Returns a list of the pdf files for the user
function get_pdfs_for_user(username, callback) {
  // Use connect method to connect to the Server
  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      //HURRAY!! We are connected. :)
      console.log('Connection established to', url);

      collection = db.collection('User_Info');

      collection.find({username: username}).toArray(function(err, results) {
        if (err) {
          console.log(err);
        } else {
          callback(results);
        }
        db.close();
      }); 
    }
  });
}

// Adds a new pdf for the user to the db
function add_pdf(username, hospital_name, date, file_path) {
  // Use connect method to connect to the Server
  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      //HURRAY!! We are connected. :)
      console.log('Connection established to', url);

      collection = db.collection('User_Info');

      fs.readFile(file_path, function (err, data) {
        if (err) {
          console.log(err);
        } else {
          var new_user_info = {username: username, hospital_name: hospital_name, date: date, file: data};
          collection.insert(new_user_info, function(err, result) {
            if (err) {
              console.log(err);
            } else {
              console.log('Inserted: ', result);
            }
            db.close();
          });
        }
      });
    }
  });
}
