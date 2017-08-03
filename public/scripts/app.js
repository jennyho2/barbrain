var app = angular.module("goalsApp", ["ngRoute", "ngStorage", "filters.stringUtils", "angularModalService", "chart.js"]);

app.controller('mainController', function($scope, $localStorage, $sessionStorage, $http)  {
	$scope.$storage = $localStorage;
	$scope.$storage.goal = new Goal($http);
	$scope.$storage.weeklySales = new Week($http, $scope);
	$scope.date = new Date();

  	$scope.options = { responsive: true };
  	$scope.weeklyLineOptions = { responsive: true };
  	$scope.weeklyLineSeries = [ "Sales" ];
  	$scope.weeklyLineLabels = 
  		[
  			"Monday",
  			"Tuesday",
  			"Wednesday",
  			"Thursday",
  			"Friday",
  			"Saturday",
  			"Sunday"
  		];

  	$scope.weeklyLineData = //[ 10, 20, 30, 40, 50, 40, 20 ];
  	[
  		$scope.$storage.weeklySales.monday,
  		$scope.$storage.weeklySales.tuesday,
  		$scope.$storage.weeklySales.wednesday,
  		$scope.$storage.weeklySales.thursday,
  		$scope.$storage.weeklySales.friday,
  		$scope.$storage.weeklySales.saturday,
  		$scope.$storage.weeklySales.sunday
  	];

  	$http.get("/staff/1")
  	.then(function(data, status, headers, config)  {
  		$scope.$storage.staff = data.data[0].staff;
  	}, function(data, status, headers, config)  {

  	});
  	$scope.labels = ["Current Sales", "Difference From Goal"];

  	// $scope.getCurrentProgress = function()  {
  	// 	blockspring.runParsed("read-cell-google-sheets", { "file_id": "14HGE-3oSeE1KBPjnGv2C4p749-9mV0JFdvyTJAHRaE0", "worksheet_id": 0, "row": 1,
   // 			"column": 2}, { "api_key": "edd7d4672aaa5a78a6dbd85af745944a" }, function(res){
   // 				$scope.$storage.currentDayProgress = parseInt(res.params.cell);
  	// 	});
  	// 	blockspring.runParsed("read-cell-google-sheets", { "file_id": "14HGE-3oSeE1KBPjnGv2C4p749-9mV0JFdvyTJAHRaE0", "worksheet_id": 0, "row": 2,
   // 			"column": 2}, { "api_key": "edd7d4672aaa5a78a6dbd85af745944a" }, function(res){
   // 				$scope.$storage.currentWeekProgress = parseInt(res.params.cell);
  	// 	});
  	// 	blockspring.runParsed("read-cell-google-sheets", { "file_id": "14HGE-3oSeE1KBPjnGv2C4p749-9mV0JFdvyTJAHRaE0", "worksheet_id": 0, "row": 3,
   // 			"column": 2}, { "api_key": "edd7d4672aaa5a78a6dbd85af745944a" }, function(res){
   // 				$scope.$storage.projectedDayEnd = parseInt(res.params.cell);
  	// 	});
  	// 	blockspring.runParsed("read-cell-google-sheets", { "file_id": "14HGE-3oSeE1KBPjnGv2C4p749-9mV0JFdvyTJAHRaE0", "worksheet_id": 0, "row": 4,
   // 			"column": 2}, { "api_key": "edd7d4672aaa5a78a6dbd85af745944a" }, function(res){
   // 				$scope.$storage.projectedWeekEnd = parseInt(res.params.cell);
  	// 	});

  	// };
  	//$scope.labels = ["Current Sales", "Daily Goal"];
  	//$scope.data = [, $scope.$storage.goal.dailyGoal];

  	$scope.labels = ["Current Sales", "Distance From Goal"];
  	$scope.data = [$scope.$storage.goal.dailyProgress, $scope.$storage.goal.dailyGoal];

    $scope.weeklyData = [500,700,
                    3000,
                    6000,4000,
                    200];
    $scope.weeklyLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

	//$scope.$storage.dailyGoal = new DailyGoal($http);
	//$scope.storage.staff = '';
	$scope.openStaff = function(staff) {
		// set data
		$scope.$storage.staff = staff;
		location.href = '#!staff';
	};
	
	$scope.callUpdateGoals = function(section)  {
		var newGoal = $('#weeklyGoalInput').val();
		//console.log("Section: " + section);
		if (section == 0)  {
			$http.post("/updateGoals", 
				{
					"location": "10 Barrel Boise",
					"dailyGoal": newGoal,
					"weeklyGoal": $scope.$storage.goal.weeklyGoal
			})
			.then(function(data,status,headers,config)  {
				$scope.$storage.goal.dailyGoal = parseInt(newGoal);
				$scope.data = [$scope.$storage.goal.currentDayProgress, (parseInt(newGoal) - $scope.$storage.goal.currentDayProgress)];
				$scope.data = [$scope.$storage.goal.dailyProgress, Math.abs($scope.$storage.goal.dailyProgress-parseInt(newGoal))];
				//$scope.dailyGoal = $storage.dailyGoal;
			}, function(data,status,headers,config)  {
				console.log("failure");
			});
		} else {
			$http.post("/updateGoals", 
				{
					"location": "10 Barrel Boise",
					"dailyGoal": $scope.$storage.goal.dailyGoal,
					"weeklyGoal": newGoal
    
			})
			.then(function(data,status,headers,config)  {
				$scope.$storage.goal.weekGoal = parseInt(newGoal);
				$scope.data = [$scope.$storage.goal.currentWeekProgress, (parseInt(newGoal) - $scope.$storage.goal.currentWeekProgress)]
				$scope.$storage.goal.weeklyGoal = parseInt(newGoal);
				$scope.data = [$scope.$storage.goal.weeklyProgress, Math.abs($scope.$storage.goal.weeklyProgress-parseInt(newGoal))];
				//$scope.dailyGoal = $storage.dailyGoal;
        
			}, function(data,status,headers,config)  {
				console.log("failure");
			});
      $scope.weeklyData =[parseInt(newGoal)*.05,.1*parseInt(newGoal),.2*parseInt(newGoal),
                        parseInt(newGoal)*.25,parseInt(newGoal)*.4,parseInt(newGoal)*.3,parseInt(newGoal)*.1];
		}
    

	}

	$scope.callUpdateDailyGoal = function()  {
		$http.post("/updateGoals",
		{
			"location": "10 Barrel Boise",
			"dailyGoal": $scope.$storage.goal.dailyGoal,
			"weeklyGoal": $scope.$storage.goal.weeklyGoal
		})
		.then(function(data,status,headers,config)  {
			$scope.data = [$scope.$storage.goal.currentDayProgress, $scope.$storage.goal.dailyGoal - $scope.$storage.goal.currentDayProgress];
		}, function(data,status,headers,config)  {
			console.log("failing");
		});
	}

	$scope.callGetGoals = function()  {
		$http.get("/goals")
		.then(function(data,status,headers,config) {
			$scope.$storage.goal.dailyGoal = parseInt(data.data[0].dailyGoal);
			$scope.data = [$scope.$storage.goal.currentDayProgress, (parseInt(data.data[0].dailyGoal) - $scope.$storage.goal.currentDayProgress)];
			$scope.min = 0;
			$scope.max = parseInt(data.data[0].weeklyGoal) + 2000;
			$scope.$storage.goal.weeklyGoal = parseInt(data.data[0].weeklyGoal);
      $scope.$storage.goal.currentDayProgress = parseFloat(data.data[0].dailyProgress);
      $scope.$storage.goal.currentWeekProgress = parseFloat(data.data[0].weeklyProgress);
			$scope.$storage.goal.dailyGoal = parseInt(data.data[0].dailyGoal);	
			$scope.$storage.goal.dailyProgress = parseInt(data.data[0].dailyProgress);
			$scope.$storage.goal.dailyProjected = parseInt(data.data[0].dailyProjected);
			$scope.$storage.goal.weeklyGoal = parseInt(data.data[0].weeklyGoal);	
			$scope.$storage.goal.weeklyProgress = parseInt(data.data[0].weeklyProgress);
			$scope.$storage.goal.weeklyProjected = parseInt(data.data[0].weeklyProjected);
		},function(data, status, headers, config)  {
			console.log('fail here');
		});
	}

	$scope.callGetTactics = function()  {
		$http.get("/tactics")
		.then(function(data,status,headers,config) {
			$scope.$storage.dailyTactic = data.data[0].dailyTactic;
			$scope.$storage.weeklyTactic = data.data[0].weeklyTactic;
		}, function(data, status, headers, config)  {
			console.log("fail getting tactics");
		});
	}

	$scope.callUpdateTactic = function(num)  {
		var newTactic = $('.tacticalGoalsInput').val();
		if (num == 0)  {
			$http.post("/updateTactics",
			{
				"location": "10 Barrel Boise",
				"dailyTactic": newTactic,
				"weeklyTactic": $scope.$storage.weeklyTactic
			})
			.then(function(data,status,headers,config)  {
				$scope.$storage.dailyTactic = newTactic;
			}, function(data,status,headers,config)  {
				console.log('failure');
			});
		} else {
			$http.post("/updateTactics",
			{
				"location": "10 Barrel Boise",
				"dailyTactic": $scope.$storage.dailyTactic,
				"weeklyTactic": newTactic
			})
			.then(function(data,status,headers,config)  {
				$scope.$storage.weeklyTactic = newTactic;
			}, function(data,status,headers,config)  {
				console.log('failure');
			});
		}
	}

$scope.updateWeek = function(section)  {
    var newGoal = $('#weekGoalInput').val();
    //console.log("Section: " + section);

      $http.post("/updateWeek", 
        {
          "location": "10 Barrel Boise",
          "weekGoal": newGoal,
      })
      .then(function(data,status,headers,config)  {
        $scope.$storage.goal.weekGoal = parseInt(newGoal);
        $scope.weeklyData = [500, 500,500,500];
        $scope.weeklyData.push(10000);
        $scope.apply();
        //$scope.dailyGoal = $storage.dailyGoal;
      }, function(data,status,headers,config)  {
        console.log("failure");
      });
    

  }

  $scope.getWeek = function()  {
    $http.get("/week")
    .then(function(data,status,headers,config) {
      $scope.$storage.goal.weekGoal = parseInt(data.data[0].dailyGoal);  
      $scope.weeklyData = [500, parseInt(data.data[0].weekGoal)];
      $scope.min = 0;
      $scope.max = parseInt(data.data[0].weekGoal) + 2000;
      $scope.$storage.goal.weekGoal = parseInt(data.data[0].weekGoal);
      $scope.$storage.goal.currentWeekProgress = parseFloat(data.data[0].weeklyProgress);
      
      // console.log("Weekly goal: " + $scope.$storage.goal.weeklyGoal);
      // console.log("Pulling: " + data.data[0].weeklyGoal);
    },function(data, status, headers, config)  {
      console.log('fail here');
    });

  }
	// $scope.getCurrentProgress();
	$scope.callGetGoals();
  	//console.log($scope.$storage.goal.dailyGoal);
	$scope.callGetTactics();
	//$scope.$storage.weeklySales.setWeeklyInfo();


	$scope.switch = function (num) {
		if (num == 0)  {
			$scope.data = [$scope.$storage.goal.currentDayProgress, ($scope.$storage.goal.dailyGoal - $scope.$storage.goal.currentDayProgress)];
		} else {
			$scope.data = [$scope.$storage.goal.currentWeekProgress, ($scope.$storage.goal.weeklyGoal - $scope.$storage.goal.currentWeekProgress)];
			//$scope.data = [400, $scope.$storage.goal.weeklyGoal];
			$scope.data = [$scope.$storage.goal.dailyProgress, Math.abs($scope.$storage.goal.dailyProgress-$scope.$storage.goal.dailyGoal)];
		}
	}

	$scope.getMonday = function ()  {
		blockspring.runParsed("read-cell-google-sheets", { "file_id": "14HGE-3oSeE1KBPjnGv2C4p749-9mV0JFdvyTJAHRaE0", "worksheet_id": 0, "row": 7,
   		"column": 2}, { "api_key": "edd7d4672aaa5a78a6dbd85af745944a" }, function(res){
   			$scope.$storage.weeklySales.monday = parseFloat(res.params.cell);
  		});
  		return $scope.$storage.weeklySales.monday;

	}

  $scope.onCallOmnivore = function () {
    $http.post("/webhookUpdate/1", 
    {
      'location': '1'
    })
    .then(function(data,status,headers,config)  {
      console.log(data);
    }, function(data,status,headers,config)  {
      console.log("failing over here");
    });
  }
});

function Goal($http)  {
	var dailyGoal = 2000;
	var weeklyGoal = 10000;
  var currentDayProgress = 200;
  var currentWeekProgress = 200;

	$http.get("/goals")
	.then(function(data, status, headers, config)  {
		dailyGoal = parseFloat(data.data[0].dailyGoal);
		weeklyGoal = parseFloat(data.data[0].weeklyGoal);
    currentDayProgress = parseFloat(data.data[0].dailyProgress);
    currentWeekProgress = parseFloat(data.data[0].weeklyProgress);
		dailyGoal = parseInt(data.data[0].dailyGoal);
		weeklyGoal = parseInt(data.data[0].weeklyGoal);
		weeklyProgress = parseInt(data.data[0].weeklyProgress);
		dailyProgress = parseInt(data.data[0].dailyProgress);
		weeklyProjected = parseInt(data.data[0].weeklyProjected);
		dailyProjected = parseInt(data.data[0].dailyProjected);
	},function(data,status,headers,config)  {
		console.log('fail hur');
	});

	this.__defineGetter__("dailyGoal", function () {
        return dailyGoal;
    });

    this.__defineSetter__("dailyGoal", function (val) {        
        val = parseFloat(val);
        dailyGoal = val;
    });

    this.__defineGetter__("weeklyGoal", function () {
        return weeklyGoal;
    });

    this.__defineSetter__("weeklyGoal", function (val) {        
        val = parseFloat(val);
        weeklyGoal = val;
    });

    this.__defineGetter__("currentDayProgress", function () {
        return currentDayProgress;
    });

    this.__defineSetter__("currentDayProgress", function (val) {        
        val = parseFloat(val);
        currentDayProgress = val;
    });

    this.__defineGetter__("currentWeekProgress", function () {
        return currentWeekProgress;
    });

    this.__defineSetter__("currentWeekProgress", function (val) {        
        val = parseFloat(val);
        currentWeekProgress = val;
    });


}



function Week($http, $scope)  {
	var monday = 0;
	var	tuesday = 0;
	var	wednesday = 0;
	var	thursday = 0;
	var	friday = 0;
	var	saturday = 0;
	var	sunday = 0;

	$http.get("/weeklySales")
	.then(function(data, status, headers, config)  {
		monday = parseFloat(data.data[0].weeklySales.monday);
		tuesday = parseFloat(data.data[0].weeklySales.tuesday);
		wednesday = parseFloat(data.data[0].weeklySales.wednesday);
		thursday = parseFloat(data.data[0].weeklySales.thursday);
		friday = parseFloat(data.data[0].weeklySales.friday);
		saturday = parseFloat(data.data[0].weeklySales.saturday);
		sunday = parseFloat(data.data[0].weeklySales.sunday);
		$scope.weeklyLineData = [ monday, tuesday, wednesday, thursday, friday, saturday, sunday];
		//$scope.$apply();
	}, function(data,status,headers,config)  {
		console.log("Failure grabbing weekly sales");
	});
		
	// blockspring.runParsed("read-cell-google-sheets", { "file_id": "14HGE-3oSeE1KBPjnGv2C4p749-9mV0JFdvyTJAHRaE0", "worksheet_id": 0, "row": 7,
 //   		"column": 2}, { "api_key": "edd7d4672aaa5a78a6dbd85af745944a" }, function(res){
 //   			monday = parseFloat(res.params.cell);
 //   			//$scope.$storage.weeklySales.monday = parseFloat(res.params.cell);
 //   			console.log($scope.$storage.weeklySales.monday);
 //   			$scope.$apply();
 //  	});
 //  	blockspring.runParsed("read-cell-google-sheets", { "file_id": "14HGE-3oSeE1KBPjnGv2C4p749-9mV0JFdvyTJAHRaE0", "worksheet_id": 0, "row": 8,
 //   		"column": 2}, { "api_key": "edd7d4672aaa5a78a6dbd85af745944a" }, function(res){
 //   			$scope.$storage.weeklySales.tuesday = parseFloat(res.params.cell);
 //   			$scope.$apply();
 //  	});
 //  	blockspring.runParsed("read-cell-google-sheets", { "file_id": "14HGE-3oSeE1KBPjnGv2C4p749-9mV0JFdvyTJAHRaE0", "worksheet_id": 0, "row": 9,
 //   		"column": 2}, { "api_key": "edd7d4672aaa5a78a6dbd85af745944a" }, function(res){
 //   			$scope.$storage.weeklySales.wednesday = parseFloat(res.params.cell);
 //   			$scope.$apply();
 //  	});
 //  	blockspring.runParsed("read-cell-google-sheets", { "file_id": "14HGE-3oSeE1KBPjnGv2C4p749-9mV0JFdvyTJAHRaE0", "worksheet_id": 0, "row": 10,
 //   		"column": 2}, { "api_key": "edd7d4672aaa5a78a6dbd85af745944a" }, function(res){
 //   			$scope.$storage.weeklySales.thursday = parseFloat(res.params.cell);
 //   			$scope.$apply();
 //  	});
 //  	blockspring.runParsed("read-cell-google-sheets", { "file_id": "14HGE-3oSeE1KBPjnGv2C4p749-9mV0JFdvyTJAHRaE0", "worksheet_id": 0, "row": 11,
 //   		"column": 2}, { "api_key": "edd7d4672aaa5a78a6dbd85af745944a" }, function(res){
 //   			$scope.$storage.weeklySales.friday = parseFloat(res.params.cell);
 //   			$scope.$apply();
 //  	});
 //  	blockspring.runParsed("read-cell-google-sheets", { "file_id": "14HGE-3oSeE1KBPjnGv2C4p749-9mV0JFdvyTJAHRaE0", "worksheet_id": 0, "row": 12,
 //   		"column": 2}, { "api_key": "edd7d4672aaa5a78a6dbd85af745944a" }, function(res){
 //   			$scope.$storage.weeklySales.saturday = parseFloat(res.params.cell);
 //   			$scope.$apply();
 //  	});
 //  	blockspring.runParsed("read-cell-google-sheets", { "file_id": "14HGE-3oSeE1KBPjnGv2C4p749-9mV0JFdvyTJAHRaE0", "worksheet_id": 0, "row": 13,
 //   		"column": 2}, { "api_key": "edd7d4672aaa5a78a6dbd85af745944a" }, function(res){
 //   			$scope.$storage.weeklySales.sunday = parseFloat(res.params.cell);
 //   			$scope.$apply();
 //  	});


	


	this.__defineGetter__("monday", function () {
        return monday;
    });

    this.__defineSetter__("monday", function (val) {        
        val = parseFloat(val);
        monday = val;
    });
    this.__defineGetter__("tuesday", function () {
        return tuesday;
    });

    this.__defineSetter__("tuesday", function (val) {        
        val = parseFloat(val);
        tuesday = val;
    });
    this.__defineGetter__("wednesday", function () {
        return wednesday;
    });

    this.__defineSetter__("wednesday", function (val) {        
        val = parseFloat(val);
        wednesday = val;
    });
    this.__defineGetter__("thursday", function () {
        return thursday;
    });

    this.__defineSetter__("thursday", function (val) {        
        val = parseFloat(val);
        thursday = val;
    });
    this.__defineGetter__("friday", function () {
        return friday;
    });

    this.__defineSetter__("friday", function (val) {        
        val = parseFloat(val);
        friday = val;
    });
    this.__defineGetter__("saturday", function () {
        return saturday;
    });

    this.__defineSetter__("saturday", function (val) {        
        val = parseFloat(val);
        saturday = val;
    });
    this.__defineGetter__("sunday", function () {
        return sunday;
    });

    this.__defineSetter__("sunday", function (val) {        
        val = parseFloat(val);
        sunday = val;
    });
}

app.config(function($routeProvider) {
  $routeProvider
  .when("/", {
  	templateUrl : "partials/home.html"
  })
  .when("/history", {
      templateUrl : "partials/history.html"
  })
  .when("/insights", {
      templateUrl : "partials/insights.html"
  })
  .when("/staff", {
  	templateUrl : "partials/staff.html"
  })
  .when("/yesterday", {
  	templateUrl : "partials/yesterday.html"
  })
  .when("/yesterdayTab", {
  	templateUrl : "partials/yesterdayTab.html"
  })
  .when("/setGoal", {
  	templateUrl : "partials/setGoal.html"
  })
  .when("/adjustStaffGoals", {
    templateUrl : "partials/adjustStaffGoals.html"
  })
  .when("/weeklyGoals", {
  	templateUrl : "partials/setWeeklyGoals.html"
  })
  .when("/weeklyGoalsTab", {
  	templateUrl : "partials/weeklyGoalsTab.html"
  })
  .when("/daily", {
    templateUrl : "partials/setDailyGoals.html"
  })
  .when("/tips", {
  	templateUrl : "partials/tips.html"
  })
    .when("/lastWeek", {
    templateUrl : "partials/lastWeek.html"
  });
});

app.run(function ($rootScope, $location, $localStorage) {

    var history = [];

    $localStorage.history = history;

    $rootScope.$on('$routeChangeSuccess', function() {
        //history.push($location.$$path);
        $localStorage.history.push($location.$$path);

    });

    $rootScope.back = function () {
    	var prevUrl = $localStorage.history.length > 1 ? $localStorage.history.splice(-2)[0] : "/";
        //var prevUrl = history.length > 1 ? history.splice(-2)[0] : "/";
        $location.path(prevUrl);
    };

});

angular.module('filters.stringUtils', [])

.filter('removeSpaces', [function() {
    return function(string) {
        if (!angular.isString(string)) {
            return string;
        }
        return string.replace(/[\s]/g, '');
    };
}]);

$(app).ready(function(){
    $("pp").click(function(){
        $(this).hide();
    });
});


function enableInput()  {
	$('.tacticalGoalsInput').prop('disabled', function(i, v) { return !v; });
}






// app.service("Contacts", function($http) {
//   this.getContacts = function() {
//     return $http.get("/contacts").
//       then(function(response) {
//         return response;
//       }, function(response) {
//         alert("Error retrieving contacts.");
//       });
//   }
// });
