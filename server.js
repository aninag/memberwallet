var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var CONTACTS_COLLECTION = "contacts";

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server. 
mongodb.MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost/', function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  } else
  {
    db = database;
    populateDB();
    db.collection(CONTACTS_COLLECTION, {strict:true}, function(err, collection) {
            if (err) {
                console.log("The CONTACTS collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
        });
  }

  // Save database object from the callback for reuse.
  //db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 3000, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// CONTACTS API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*  "/contacts"
 *    GET: finds all contacts
 *    POST: creates a new contact
 */

app.get("/contacts", function(req, res) {
  db.collection(CONTACTS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get contacts.");
    } else {
      res.status(200).json(docs);  
    }
  });
});

app.post("/contacts", function(req, res) {
  var newContact = req.body;
  newContact.createDate = new Date();

  if (!(req.body.firstname || req.body.lastname)) {
    handleError(res, "Invalid user input", "Must provide a first or last name.", 400);
      return;
  }

  db.collection(CONTACTS_COLLECTION).insertOne(newContact, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new contact.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

/*  "/contacts/:id"
 *    GET: find contact by id
 *    PUT: update contact by id
 *    DELETE: deletes contact by id
 */

app.get("/contacts/:id", function(req, res) {
  db.collection(CONTACTS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get contact");
    } else {
      res.status(200).json(doc);  
    }
  });
});

app.put("/contacts/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(CONTACTS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update contact");
    } else {
      res.status(204).end();
    }
  });
});

app.delete("/contacts/:id", function(req, res) {
  db.collection(CONTACTS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete contact");
    } else {
      res.status(204).end();
    }
  });
});


var populateDB = function() {

    var user = {
            first_name: "nagendra",
            last_name: "sanjeeva",
            primary_email: "dummy@gmail.com",
            primary_phone: "13145545454",
            member_since: "1-1-2006",
            member_expiry: "12-30-2016",

            address: {
                      street: "271 Rockville Place",
                      city: "saint louis",
                      zip: "63141",
                      state: "mo",
                      country: "usa"
                  },

            members: [
                {
                    name: "kid1",
                    sex: "male",
                    age: 13
                },
                {
                    name: "kid1",
                    sex: "male",
                    age: 13
                }
            ],

            moreinfo: {
                secondary_email: "dummy1@gmail.com",
                secondary_phone: "13144678888"
              }
            
        };



db.collection(CONTACTS_COLLECTION).insertOne(user, function(err, result) {
    if (err) {
        console.log("Failed to create new contact.");
    } 
  });
};
