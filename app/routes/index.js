const router = require('express').Router(),
	  moment = require('moment'),
	  request = require('request');
	  
const database = require('../db');
var $ = require('jquery')(require("jsdom").jsdom().parentWindow);
const LavuService = require('../services/LavuService'),
	  LocationService = require('../services/Locations');


router.get('/', function(request, response) {
	response.render('pages/index');
});



var api_url = "https://api.poslavu.com/cp/reqserv/";
var datanameString = ""; //"cerveza_patago13";  // cerveza_patago9
var keyString = ""; //"XCXxRHUsSuF3n3D4s6Lm"; // Wut9Y3BigxgEgChgzvNB
var tokenString = ""; //"bsn9GpsHt8UClvnEukGa"; // YjVS0nEgBXI9gSh5dmuC
var tableString = "orders";


var GOALS_COLLECTION = "goals";
var TACTICS_COLLECTION = "tactics";
var SALES_COLLECTION = "sales";

var STAFF_COLLECTION = "staff";
var TICKETS_COLLECTION = "tickets";


Date.prototype.getUnixTime = function() { return this.getTime() / 1000 | 0 };
if (!Date.now) Date.now = function() { return new Date(); };
Date.time = function() { return Date.now().getUnixTime(); };


const handleError = (res, err, message) => {
	console.log(err, message);
	res.status(500).send({ success: false, error: err, message: message });
};


router.get("/goals", function(req, res) {
	database.connect().then(db => {
			db.collection(GOALS_COLLECTION).find({}).toArray(function(err, docs) {
				if (err) {
					handleError(res, err.message, "Failed to get goals.");
				}
				else {
					res.status(200).json(docs);
				}
			});
		})
		.catch(err => handleError(res, err));
});

router.post("/updateGoals", function(req, res) {
	var newGoal = req.body;
	newGoal.createDate = new Date();

	database.connect().then(db => {
			db.collection(GOALS_COLLECTION).updateOne({ location: "10 Barrel Boise" }, {
				$set: {
					dailyGoal: newGoal.dailyGoal,
					weeklyGoal: newGoal.weeklyGoal
				}
			}, function(err, doc) {
				if (err) {
					handleError(res, err.message, "Failed to update goals.");
				}
				else {
					res.status(200).end();
					//res.status(204).end();
				}
			});
		})
		.catch(err => handleError(res, err));
});


router.get("/tactics", function(req, res) {
	database.connect().then(db => {
			db.collection(TACTICS_COLLECTION).find({}).toArray(function(err, docs) {
				if (err) {
					handleError(res, err.message, "Failed to get tactics.");
				}
				else {
					res.status(200).json(docs);
				}
			});
		})
		.catch(err => handleError(res, err));
});

router.post("/updateTactics", function(req, res) {
	var newTactics = req.body;
	newTactics.createDate = new Date();

	database.connect().then(db => {
			db.collection(TACTICS_COLLECTION).updateOne({ location: "10 Barrel Boise" }, {
				$set: {
					dailyTactics: newTactics.tactics.dailyTactics,
					weeklyTactics: newTactics.tactics.weeklyTactics
				}
			}, function(err, doc) {
				if (err) {
					handleError(res, err.message, "Failed to update tactics.");
				}
				else {
					res.status(200).end();
				}
			});
		})
		.catch(err => handleError(res, err));
});

router.get("/staff", function(req, res) {
	database.connect().then(db => {
			db.collection(STAFF_COLLECTION).find({}).toArray(function(err, docs) {
				if (err) {
					handleError(res, err.message, "Failed to get staff.");
				}
				else {
					res.status(200).json(docs);
				}
			});
		})
		.catch(err => handleError(res, err));
});

router.post("/updateStaff", function(req, res) {
	var newStaff = req.body;
	newStaff.createDate = new Date();

	database.connect().then(db => {
			db.collection(TACTICS_COLLECTION).updateOne({ location: "10 Barrel Boise" }, {
				$set: {
					staff: newStaff
				}
			}, function(err, doc) {
				if (err) {
					handleError(res, err.message, "Failed to update Staff.");
				}
				else {
					res.status(200).end();
				}
			});
		})
		.catch(err => handleError(res, err));
});

router.get("/weeklySales", function(req, res) {
	database.connect().then(db => {
			db.collection(SALES_COLLECTION).find({}).toArray(function(err, docs) {
				if (err) {
					handleError(res, err.mesage, "Failed to get sales.");
				}
				else {
					res.status(200).json(docs);
				}
			});
		})
		.catch(err => handleError(res, err));
});

router.get("/staff/:location", function(req, res) {
	var location = req.params.location;
	database.connect().then(db => {
			db.collection(STAFF_COLLECTION).find({ "location": parseInt(location) }).toArray(function(err, docs) {
				if (err) {
					handleError(res, err.message, "Failed to get staff.");
				}
				else {
					res.status(200).json(docs);
				}
			});
		})
		.catch(err => handleError(res, err));
});

router.post("/webhookUpdate/:location", function(req, res) {
	database.connect().then(db => {

			var today = new Date();
			today.setHours(0, 0, 0, 0);
			today.setDate(today.getDate() - 1);

			var options = {
				url: 'https://api.omnivore.io/1.0/locations/jcyazEnc/tickets?limit=100&where=gte(opened_at,' + today.getUnixTime(),
				headers: {
					'Api-Key': '5864a33ba65e4f0390b5994c13b15fe4'
				}
			};

			function callback(error, response, body) {
				if (!error && response.statusCode == 200) {
					var total = 0.0;
					var info = JSON.parse(body);
					var tickets = info._embedded.tickets;
					for (var i = 0, len = tickets.length; i < len; i++) {
						if (tickets[i].closed_at != null) {
							db.collection(TICKETS_COLLECTION).updateMany({
								id: tickets[i].id
							}, {
								$set: {
									id: tickets[i].id,
									total: tickets[i].totals.total / 100,
									opened_at: tickets[i].opened_at,
									closed_at: tickets[i].closed_at
								}
							}, {
								upsert: true,
							});
							total += tickets[i].totals.total / 100;
							console.log(tickets[i]);
						}
					}

					console.log(total);
					db.collection(GOALS_COLLECTION).updateOne({
						location: 1
					}, {
						$set: {
							dailyProgress: total
						}
					});
				}
			}

			request(options, callback);

			res.status(200).end();
		})
		.catch(err => handleError(res, err));

	// var dailySales = 90;
	// var weeklySales = 200;
	// db.collection(GOALS_COLLECTION).updateOne({
	//   location: 1
	// },
	// {
	//   $set: {
	//     dailyProgress : dailySales,
	//     weeklyProgress: weeklySales
	//   }
	// }, function(err, doc)  {
	//   if (err)  {
	//     handleError(res, err.message, "Failed to update sales.");
	//   } else {
	//     res.status(200).end();
	//   }
	// });
	// poll Omnivore API to grab all tickets for today & accumulate total sales
	// poll Omnivore API to grab all tickets for week & accumulate total sales
	// store daily sales and then just add for week
	// then update database

});

router.get("/webhookUpdate/:location", function(req, res) {
	res.send("c6d1b589165541368d1faccee55a3163").end();
});


router.get("/sales", function(req, res) {
	database.connect().then(db => {
			db.collection(SALES_COLLECTION).find({}).toArray(function(err, docs) {
				if (err) {
					handleError(res, err.message, "Failed to get sales.");
				}
				else {
					res.status(200).json(docs);
				}
			});
		})
		.catch(err => handleError(res, err));
});


router.post("/updateSales", function(req, res) {
	var newSales = req.body;
	newSales.createDate = new Date();

	database.connect().then(db => {
			db.collection(SALES_COLLECTION).updateOne({ location: "10 Barrel Boise" }, {
				$set: {
					sales: newSales
				}
			}, function(err, doc) {
				if (err) {
					handleError(res, err.message, "Failed to update Staff.");
				}
				else {
					res.status(200).end();
				}
			});
		})
		.catch(err => handleError(res, err));
});

router.get("/locations/:location_id/salessummary/:from_date/:to_date?", (req, res) => {
	var location = req.params.location_id,
		fromDate = moment(req.params.from_date, 'YYYYMMDD'),
		toDate = req.params.to_date ? moment(req.params.to_date, 'YYYYMMDD') : null,
		refresh = req.query.refresh == 'true';


	var minDate = moment(fromDate).hour(0).minute(0).second(0).toDate();
	var maxDate = toDate ? moment(toDate).hour(0).minute(0).second(0).toDate() : moment(minDate).add(1, 'day').toDate();
		
	new LocationService().resolve(location)
	.then(({ datanameString, keyString, tokenString }) => new LavuService().configure(datanameString, keyString, tokenString, datanameString))
	.then(service => service.getSalesSummary(minDate, maxDate, refresh))
	.then(data => res.json({ success: true, data }))
	.catch(err => { console.log(err); res.status(500).json({ success: false, error: err }); });
});

router.get("/locations/:location_id/staffsales/:from_date/:to_date?", (req, res) => {
	var location = req.params.location_id,
		fromDate = moment(req.params.from_date, 'YYYYMMDD'),
		toDate = req.params.to_date ? moment(req.params.to_date, 'YYYYMMDD') : null;

	var minDate = moment(fromDate).hour(3).minute(0).second(0).toDate();
	var maxDate = toDate ? moment(toDate).hour(3).minute(0).second(0).toDate() : moment(minDate).add(1, 'day').toDate();
		
	new LocationService().resolve(location)
	.then(({ datanameString, keyString, tokenString }) => new LavuService().configure(datanameString, keyString, tokenString, datanameString))
	.then(service => service.getStaffSalesSummary(minDate, maxDate))
	.then(data => res.json({ success: true, data }))
	.catch(err => { console.log(err); res.status(500).json({ success: false, error: err }); });
});

router.post('/locations/:location_id/goals/weekly', (req, res) => {
	var location = req.params.location_id;
	new LocationService().resolve(location)
	.then(({ datanameString, keyString, tokenString }) => new LavuService().configure(datanameString, keyString, tokenString, datanameString))
	.then(service => service.setWeeklyGoal(req.body.value))
	.then(data => res.json({ success:true, data }))
	.catch(err => { console.log(err); res.status(500).json({ success: false, error: err }); });
});

router.get('/locations/:location_id/goals/weekly', (req, res) => {
	var location = req.params.location_id;
	new LocationService().resolve(location)
	.then(({ datanameString, keyString, tokenString }) => new LavuService().configure(datanameString, keyString, tokenString, datanameString))
	.then(service => service.getWeeklyGoal())
	.then(data => res.json({ success:true, data }))
	.then(err => { console.log(err); res.status(500).json({ success: false, error: err }); });
});

router.get('/locations/:location_id/goals/:from_date/:to_date?', (req, res) => {
	var location = req.params.location_id,
		fromDate = moment(req.params.from_date, 'YYYYMMDD'),
		toDate = req.params.to_date ? moment(req.params.to_date, 'YYYYMMDD') : null;
	var minDate = moment(fromDate).hour(3).minute(0).second(0).toDate();
	var maxDate = toDate ? moment(toDate).hour(3).minute(0).second(0).toDate() : moment(minDate).add(1, 'day').toDate();
	var weekly;
	if (toDate) {
		weekly = true;
	}
	else {
		weekly = false;
	}

	new LocationService().resolve(location)
	.then(({ datanameString, keyString, tokenString }) => new LavuService().configure(datanameString, keyString, tokenString, datanameString))
	.then(service => service.getGoalsSummary(minDate, maxDate, weekly))
	.then(data => res.json({ success: true, data }))
	.catch(err => { console.log(err); res.status(500).json({ success: false, error: err }); });
});

router.get('/locations/:location_id/menugroups', (req, res) => {
	var location = req.params.location_id;
	new LocationService().resolve(location)
	.then(({ datanameString, keyString, tokenString }) => new LavuService().configure(datanameString, keyString, tokenString, datanameString))
	.then(service => service.loadMenuGroups())
	.then(data => res.json({ success:true, data }))
	.then(err => { console.log(err); res.status(500).json({ success: false, error: err }); });
});

router.post('/locations/:location_id/incentives/weekly', (req, res) => {
	var location = req.params.location_id;
	new LocationService().resolve(location)
	.then(({ datanameString, keyString, tokenString }) => new LavuService().configure(datanameString, keyString, tokenString, datanameString))
	.then(service => service.setWeeklyIncentive( req.body.incentive, req.body.goal ))
	.then(data => res.json({ success:true, data }))
	.then(err => { console.log(err); res.status(500).json({ success: false, error: err }); });
});

router.get('/locations/:location_id/incentives/weekly', (req, res) => {
	var location = req.params.location_id;
	new LocationService().resolve(location)
	.then(({ datanameString, keyString, tokenString }) => new LavuService().configure(datanameString, keyString, tokenString, datanameString))
	.then(service => service.getWeeklyIncentive())
	.then(data => res.json({ success:true, data }))
	.then(err => { console.log(err); res.status(500).json({ success: false, error: err }); });
});

router.get('/locations/:location_id/sales/weektodate/:from_date/:to_date', (req, res) => {
	var location = req.params.location_id,
		from_date = moment(req.params.from_date, 'YYYYMMDD'),
		to_date = moment(req.params.to_date, 'YYYYMMDD');
	var newFromDate = moment(from_date).hour(3).minute(0).second(0).toDate();
	var newToDate = moment(to_date).hour(3).minute(0).second(0).toDate();
	new LocationService().resolve(location)
	.then(({ datanameString, keyString, tokenString }) => new LavuService().configure(datanameString, keyString, tokenString, datanameString))
	.then(service => service.getSalesSection(from_date, to_date))
	.then(data => res.json({ success:true, data }))
	.then(err => { console.log(err); res.status(500).json({ success:false, error: err }); });
});


router.post('/locations/:location_id/goals/daily/:date', (req, res) => {
	var location = req.params.location_id,
		date = moment(req.params.date, 'YYYYMMDD');
	var newDate = moment(date).hour(3).minute(0).second(0).toDate();
	new LocationService().resolve(location)
	.then(({ datanameString, keyString, tokenString }) => new LavuService().configure(datanameString, keyString, tokenString, datanameString))
	.then(service => service.setDailyGoal(newDate, req.body.value))
	.then(data => res.json({ success:true, data }))
	.then(err => { console.log(err); res.status(500).json({ success:false, error: err }); });
});

router.get('/locations/:location_id/goals/daily/:date', (req, res) => {
	var location = req.params.location_id,
		date = moment(req.params.date, 'YYYYMMDD');
	var newDate = moment(date).hour(3).minute(0).second(0).toDate();
	new LocationService().resolve(location)
	.then(({ datanameString, keyString, tokenString }) => new LavuService().configure(datanameString, keyString, tokenString, datanameString))
	.then(service => service.getDailyGoal(newDate))
	.then(data => res.json({ success:true, data }))
	.then(err => { console.log(err); res.status(500).json({ success: false, error: err }); });
});

router.post('/locations/:location_id/goals/weekly/:date', (req, res) => {
	var location = req.params.location_id,
		date = moment(req.params.date, 'YYYYMMDD');
	var newDate = moment(date).hour(3).minute(0).second(0).toDate();
	new LocationService().resolve(location)
	.then(({ datanameString, keyString, tokenString }) => new LavuService().configure(datanameString, keyString, tokenString, datanameString))
	.then(service => service.setWeeklyGoal(newDate, req.body.value))
	.then(data => res.json({ success:true, data }))
	.catch(err => { console.log(err); res.status(500).json({ success: false, error: err }); });
});

/*
function getCategoryInfo($sender, $row, period, res)  {
  var order_id = $row.find('order_id').text();
  request.post(api_url, {form:{dataname:datanameString,key:keyString,token:tokenString,table:"order_contents",valid_xml:1,limit:10000,column:"order_id",value:order_id }
  }, function(error, response, body2)  { 
	$(body2).find('row').each(function()  {
	  var $row2 = $(this);
	  var item_id = $row2.find('item_id').text();
	  
	  request.post(api_url, {form:{dataname:datanameString,key:keyString,token:tokenString,table:"menu_items",valid_xml:1,limit:10000,column:"id",value:item_id }
	  }, function(error, response, body3)  {
		var $row3 = $(body3).find('row');
		var category_id = $row3.find('category_id').text();
		request.post(api_url, {form:{dataname:datanameString,key:keyString,token:tokenString,table:"menu_categories",valid_xml:1,limit:10000,column:"id",value:category_id }
		}, function(error, response, body4)  {
		  var $row4 = $(body4).find('row');
		  var group_id = $row4.find('group_id').text();
		  request.post(api_url, {form:{dataname:datanameString,key:keyString,token:tokenString,table:"menu_groups",valid_xml:1,limit:10000,column:"id",value:group_id }
		  }, function(error, response, body5)  {
			  var $row5 = $(body5).find('row');
			  var group_name = $row5.find('group_name').text();
			  
			  if ($sender.categories.hasOwnProperty(group_name))  {
				
				$sender.categories[group_name].sales += parseFloat($row2.find('total_with_tax').text());
				$sender.categories[group_name].orders += parseFloat($row2.find('quantity').text());
				console.log($sender.categories);
			  } else {
				
				$sender.categories[group_name] = {};
				$sender.categories[group_name].name = group_name;
				$sender.categories[group_name].sales = parseFloat($row2.find('total_with_tax').text());
				$sender.categories[group_name].orders = parseFloat($row2.find('quantity').text());
				console.log($sender.categories);
			  }
			  return res.send($sender).status(200).end();
			}, function(response5)  {
			  console.log("fail5");
			}); // request post groups
		  }, function(response4)  {
			console.log("fail4");
		  }); // request post categories
		}, function(response3)  {
		  console.log("fail3");
		}); // request post items
	  }, function(response2)  { // each succes/failure
		console.log("fail2");
	  }); // each
	}); // request post
};
*/
// if ($scope.$storage.lavuStaff[period].categories.hasOwnProperty(group_name))  {
//   $scope.$storage.lavuStaff[period].categories[group_name].sales += parseFloat($row2.find('total_with_tax').text());
//   $scope.$storage.lavuStaff[period].categories[group_name].orders += parseFloat($row2.find('quantity').text());
// } else {
//   $scope.$storage.lavuStaff[period].categories[group_name] = {}; 
//   $scope.$storage.lavuStaff[period].categories[group_name].name = group_name;
//   $scope.$storage.lavuStaff[period].categories[group_name].sales = parseFloat($row2.find('total_with_tax').text());
//   $scope.$storage.lavuStaff[period].categories[group_name].orders = parseFloat($row2.find('quantity').text());
// }
// if (item_id == $scope.$storage.incentiveId)  {
//   var server = $row.find('server').text();
//   if ($scope.$storage.lavuStaff[period].incentiveSales.hasOwnProperty(server))  {
//     $scope.$storage.lavuStaff[period].incentiveSales[server].sales += parseFloat($row2.find('total_with_tax').text());
//     $scope.$storage.lavuStaff[period].incentiveSales[server].orders += parseFloat($row2.find('quantity').text());
//   } else {
//     $scope.$storage.lavuStaff[period].incentiveSales[server] = {};
//     $scope.$storage.lavuStaff[period].incentiveSales[server].name = server;
//     $scope.$storage.lavuStaff[period].incentiveSales[server].sales = parseFloat($row2.find('total_with_tax').text());
//     $scope.$storage.lavuStaff[period].incentiveSales[server].orders = parseFloat($row2.find('quantity').text());
//   }
//   if ($scope.$storage.lavuStaff[period].hasOwnProperty('totalIncentiveSales'))  {
//     $scope.$storage.lavuStaff[period].totalIncentiveSales += parseFloat($row2.find('total_with_tax').text());
//     $scope.$storage.lavuStaff[period].totalIncentiveOrders += parseFloat($row2.find('quantity').text());
//   } else {
//     $scope.$storage.lavuStaff[period].totalIncentiveSales = parseFloat($row2.find('total_with_tax').text());
//     $scope.$storage.lavuStaff[period].totalIncentiveOrders = parseFloat($row2.find('quantity').text());
//   }
// }



// Bariloche cerveza_patago13 XCXxRHUsSuF3n3D4s6Lm bsn9GpsHt8UClvnEukGa
// Tejeda cerveza_patago9 Wut9Y3BigxgEgChgzvNB YjVS0nEgBXI9gSh5dmuC
// Goose Island goose_island_p fUOEUo4DToNuuTLuda04 R65QzAE6RnctGY8Dta2n

router.get("/lookupLavuToday", function(req, res) {
	var today = new Date();
	today.setHours(3, 0, 0, 0);
	var tomorrow = new Date();
	tomorrow.setDate(today.getDate() + 1);
	//console.log("daily: ");
	//console.log(today + ". " + tomorrow);

	request.post(api_url, {
		form: { dataname: datanameString, key: keyString, token: tokenString, table: tableString, valid_xml: 1, limit: 10000, column: "closed", value_min: today.toISOString().substring(0, 19).replace('T', ' '), value_max: tomorrow.toISOString().substring(0, 19).replace('T', ' ') }
	}, function(error, response, body) {
		var sender = {};
		var total = 0;
		sender.staff = {};
		sender.incentiveSales = {};
		sender.totalIncentiveSales = 0.0;
		sender.totalIncentiveOrders = 0;
		sender.yesterdayTotalSales = 0.0;
		sender.yesterdayTotalOrders = 0;
		sender.categories = {};
		//console.log("Body: " + body.data);
		// response.data.querySelectorAll('row');
		$(body.data).find('row').each(function() {
			//  console.log($(this).find('id').text());
			var $row = $(this);
			var id = $row.find('id').text();
			total += parseFloat($row.find('total').text());
			console.log("Here: " + $row.find('total').text());

			// //$scope.$storage.lavuStaff.yesterday = {};

			// // $scope.$storage.lavuStaff.yesterdayTotalOrders = 0;
			// // $scope.$storage.lavuStaff.yesterdayTotalSales = 0.0;
			// // $scope.$storage.lavuStaff.yesterday.categories = {};
			//   var serverName = $row.find('server').text();
			//   sender.yesterdayTotalOrders++;
			//   sender.yesterdayTotalSales += parseFloat($row.find('total').text());
			//   // $scope.$storage.lavuStaff.yesterdayTotalOrders++;
			//   // $scope.$storage.lavuStaff.yesterdayTotalSales += parseFloat($row.find('total').text());
			//   if (sender.staff.hasOwnProperty(serverName))  {
			//     sender.staff[serverName].sales += parseFloat($row.find('total').text());
			//     sender.staff[serverName].order++;
			//   } else {
			//     sender.staff[serverName] = {};
			//     sender.staff[serverName].name = serverName;
			//     sender.staff[serverName].sales = parseFloat($row.find('total').text());
			//     sender.staff[serverName].orders = 1;
			//   }

			// if ($scope.$storage.lavuStaff.yesterday.staff.hasOwnProperty(serverName))  {
			//   $scope.$storage.lavuStaff.yesterday.staff[serverName].sales += parseFloat($row.find('total').text());
			//   $scope.$storage.lavuStaff.yesterday.staff[serverName].orders++;
			// } else {
			//   $scope.$storage.lavuStaff.yesterday.staff[serverName] = {};
			//   $scope.$storage.lavuStaff.yesterday.staff[serverName].name = serverName;
			//   $scope.$storage.lavuStaff.yesterday.staff[serverName].sales = parseFloat($row.find('total').text());
			//   $scope.$storage.lavuStaff.yesterday.staff[serverName].orders = 1;
			// }
			//getCategoryInfo($row, $scope, $http, "yesterday");
		});
		//$scope.data.yesterday = [$scope.$storage.lavuStaff.yesterdayTotalSales, $scope.$storage.goal.dailyGoal];
		sender.yesterdayAverageTicket = sender.yesterdayTotalSales / sender.yesterdayTotalOrders;
		//$scope.$storage.lavuStaff.yesterdayAverageTicket = $scope.$storage.lavuStaff.yesterdayTotalSales / $scope.$storage.lavuStaff.yesterdayTotalOrders;
		console.log(total);
		//console.log(body);
		res.send(body).status(200).end();
	});
});

router.get("/lookupLastWeekLavu", function(req, res) {
	//var today = new Date();
	var d = new Date();
	var day = d.getDay(),
		diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
	var lastMonday = new Date(d.setDate(diff));
	lastMonday.setHours(3, 0, 0, 0);
	var ending = new Date();
	ending.setDate(lastMonday.getDate());
	ending.setHours(2, 59, 59, 999);
	lastMonday.setDate(lastMonday.getDate() - 7);

	// console.log("Last Monday: " + lastMonday);
	// console.log("Ending: " + ending);
	request.post(api_url, {
		form: { dataname: datanameString, key: keyString, token: tokenString, table: tableString, valid_xml: 1, limit: 10000, column: "closed", value_min: lastMonday.toISOString().substring(0, 19).replace('T', ' '), value_max: ending.toISOString().substring(0, 19).replace('T', ' ') }
	}, function(error, response, body) {
		//console.log(body);
		res.send(body).status(200).end();
	});
});

router.get("/lookupLastMonthLavu", function(req, res) {
	var date = new Date();
	var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
	firstDay.setHours(3, 0, 0, 0);
	var tomorrow = new Date();
	tomorrow.setDate(date.getDate() + 1);
	console.log(firstDay);
	request.post(api_url, {
		form: { dataname: datanameString, key: keyString, token: tokenString, table: tableString, valid_xml: 1, limit: 10000, column: "closed", value_min: firstDay.toISOString().substring(0, 19).replace('T', ' '), value_max: tomorrow.toISOString().substring(0, 19).replace('T', ' ') }
	}, function(error, response, body) {
		//console.log(body);
		res.send(body).status(200).end();
	});
});

router.post("/updateTodaySales/:location", function(req, res) {
	var locationParam = req.params.location;
	var newSales = req.body;
	newSales.createDate = new Date();

	database.connect().then(db => {
			db.collection(GOALS_COLLECTION).updateOne({}, {
				$set: {
					dailyProgress: newSales.dailyProgress
				}
			}, function(err, doc) {
				if (err) {
					handleError(res, err.message, "Failed to update goals.");
				}
				else {
					res.status(200).end();
				}
			});
		})
		.catch(err => handleError(res, err));
});


router.post("/updateYesterdaySales/:location", function(req, res) {
	var locationParam = req.params.location;
	var newSales = req.body;
	newSales.createDate = new Date();

	console.log(locationParam);
	console.log("sup: " + newSales.yesterdaySales);

	database.connect().then(db => {
			db.collection(GOALS_COLLECTION).updateOne({}, {
				$set: {
					yesterdaySales: newSales.yesterdaySales
				}
			}, function(err, doc) {
				if (err) {
					handleError(res, err.message, "Failed to update tactics.");
				}
				else {
					res.status(200).end();
				}
			});
		})
		.catch(err => handleError(res, err));
});

router.get("/lookupLavuOrder_Contents/:order_id", function(req, res) {
	var order_idParam = req.params.order_id;
	request.post(api_url, {
		form: { dataname: datanameString, key: keyString, token: tokenString, table: "order_contents", valid_xml: 1, limit: 10000, column: "order_id", value: order_idParam }
	}, function(error, response, body) {
		//console.log(body);
		res.send(body).status(200).end();
	});
});

router.get("/lookupLavuItems/:item_id", function(req, res) {
	var item_idParam = req.params.item_id;
	request.post(api_url, {
		form: { dataname: datanameString, key: keyString, token: tokenString, table: "menu_items", valid_xml: 1, limit: 10000, column: "id", value: item_idParam }
	}, function(error, response, body) {
		//console.log(body);
		res.send(body).status(200).end();
	});
});

router.get("/lookupLavuCategory/:category_id", function(req, res) {
	var category_idParam = req.params.category_id;
	request.post(api_url, {
		form: { dataname: datanameString, key: keyString, token: tokenString, table: "menu_categories", valid_xml: 1, limit: 10000, column: "id", value: category_idParam }
	}, function(error, response, body) {
		//console.log(body);
		res.send(body).status(200).end();
	});
});

router.get("/lookupLavuGroup/:group_id", function(req, res) {
	var group_idParam = req.params.group_id;
	request.post(api_url, {
		form: { dataname: datanameString, key: keyString, token: tokenString, table: "menu_groups", valid_xml: 1, limit: 10000, column: "id", value: group_idParam }
	}, function(error, response, body) {
		//console.log(body);
		res.send(body).status(200).end();
	});
});

router.get("/lookupLavuItems", function(req, res) {
	request.post(api_url, {
		form: { dataname: datanameString, key: keyString, token: tokenString, table: "menu_items", valid_xml: 1, limit: 10000 }
	}, function(error, resposne, body) {
		res.send(body).status(200).end();
	});
});

router.get('/locations', (req, res) => {
	new LocationService().all()
	.then(locations => res.json(locations))
	.catch(error => res.status(500).json({ success: false, error }));
})

router.get("/resolveLocation/:location_id", function(req, res) {
	var location_idParam = req.params.location_id;
	
	new LocationService().resolve(location_idParam)
	.then(location => res.json(location));
});

module.exports = router;





