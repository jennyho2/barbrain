var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

// app.listen(app.get('port'), function() {
//   console.log('Node app is running on port', app.get('port'));
//  });

var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var GOALS_COLLECTION = "goals";

var TACTICS_COLLECTION = "tactics";
var WEEKLY_SET = "weekGoal";

app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});


app.get("/goals", function(req, res) {
  db.collection(GOALS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get goals.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.post("/updateGoals", function(req, res) {
  var newGoal = req.body;
  newGoal.createDate = new Date();

  db.collection(GOALS_COLLECTION).updateOne(
	   { location: "10 Barrel Boise" },
	   {
	     $set: {
	       dailyGoal: newGoal.dailyGoal,
	       weeklyGoal: newGoal.weeklyGoal
	     }
	   }, function(err, doc)  {
	   	if (err)  {
	   		handleError(res, err.message, "Failed to update goals.");
	   	} else {
	   		res.status(200).end();
	   		//res.status(204).end();
	   	}
   });
});


app.get("/tactics", function(req, res) {
  db.collection(TACTICS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get tactics.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.post("/updateTactics", function(req, res)  {
	var newTactics = req.body;
	newTactics.createDate = new Date();

	db.collection(TACTICS_COLLECTION).updateOne(
		{ location: "10 Barrel Boise" },
		{
			$set: {
				dailyTactic: newTactics.dailyTactic,
				weeklyTactic: newTactics.weeklyTactic
			}
		}, function(err, doc)  {
			if (err)  {
				handleError(res, err.message, "Failed to update tactics.");
			} else {
				res.status(200).end();
			}
		});
});

app.get("/week", function(req, res) {
  db.collection(WEEKLY_SET).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get goals.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.post("/updateWeek", function(req, res) {
  var newWeekGoal = req.body;
  newWeekGoal.createDate = new Date();

  db.collection(WEEKLY_SET).updateOne(
     { location: "10 Barrel Boise" },
     {
       $set: {
         weekGoal: newWeekGoal.weekGoal
       }
     }, function(err, doc)  {
      if (err)  {
        handleError(res, err.message, "Failed to update goals.");
      } else {
        res.status(200).end();
        //res.status(204).end();
      }
   });
});





