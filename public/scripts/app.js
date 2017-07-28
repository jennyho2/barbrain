var app = angular.module("goalsApp", ["ngRoute", "ngStorage", "filters.stringUtils", "angularModalService", "chart.js"]);

app.controller('mainController', function($scope, $localStorage, $sessionStorage, $http)  {
	$scope.$storage = $localStorage;
	$scope.$storage.goal = new Goal($http);
	$scope.date = new Date();

  	$scope.options = { responsive: true };

  	$scope.labels = ["Current Sales", "Difference From Goal"];

  	$scope.getCurrentProgress = function()  {
  		blockspring.runParsed("read-cell-google-sheets", { "file_id": "14HGE-3oSeE1KBPjnGv2C4p749-9mV0JFdvyTJAHRaE0", "worksheet_id": 0, "row": 1,
   			"column": 2}, { "api_key": "edd7d4672aaa5a78a6dbd85af745944a" }, function(res){
   				$scope.$storage.currentDayProgress = parseInt(res.params.cell);
  		});
  		blockspring.runParsed("read-cell-google-sheets", { "file_id": "14HGE-3oSeE1KBPjnGv2C4p749-9mV0JFdvyTJAHRaE0", "worksheet_id": 0, "row": 2,
   			"column": 2}, { "api_key": "edd7d4672aaa5a78a6dbd85af745944a" }, function(res){
   				$scope.$storage.currentWeekProgress = parseInt(res.params.cell);
  		});
  		blockspring.runParsed("read-cell-google-sheets", { "file_id": "14HGE-3oSeE1KBPjnGv2C4p749-9mV0JFdvyTJAHRaE0", "worksheet_id": 0, "row": 3,
   			"column": 2}, { "api_key": "edd7d4672aaa5a78a6dbd85af745944a" }, function(res){
   				$scope.$storage.projectedDayEnd = parseInt(res.params.cell);
  		});
  		blockspring.runParsed("read-cell-google-sheets", { "file_id": "14HGE-3oSeE1KBPjnGv2C4p749-9mV0JFdvyTJAHRaE0", "worksheet_id": 0, "row": 4,
   			"column": 2}, { "api_key": "edd7d4672aaa5a78a6dbd85af745944a" }, function(res){
   				$scope.$storage.projectedWeekEnd = parseInt(res.params.cell);
  		});

  	};
  	$scope.labels = ["Current Sales", "Daily Goal"];
  	$scope.data = [500, $scope.$storage.goal.dailyGoal];

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
				$scope.data = [$scope.$storage.currentDayProgress, (parseInt(newGoal) - $scope.$storage.currentDayProgress)];
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
				$scope.data = [$scope.$storage.currentWeekProgress, (parseInt(newGoal) - $scope.$storage.currentWeekProgress)]
				$scope.$storage.goal.weeklyGoal = parseInt(newGoal);
        $scope.weeklyData = [.15*parseInt(newGoal),.2*parseInt(newGoal),
                          .3*parseInt(newGoal),.5*parseInt(newGoal),
                          .6*parseInt(newGoal),.4*parseInt(newGoal),
                          .3*parseInt(newGoal)] //FIX THIS
				//$scope.dailyGoal = $storage.dailyGoal;
        
        
			}, function(data,status,headers,config)  {
				console.log("failure");
			});
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
			$scope.data = [$scope.$storage.currentDayProgress, $scope.$storage.goal.dailyGoal - $scope.$storage.currentDayProgress];
		}, function(data,status,headers,config)  {
			console.log("failing");
		});
	}

	$scope.callGetGoals = function()  {
		$http.get("/goals")
		.then(function(data,status,headers,config) {
			$scope.$storage.goal.dailyGoal = parseInt(data.data[0].dailyGoal);	
			$scope.data = [$scope.$storage.currentDayProgress, (parseInt(data.data[0].dailyGoal) - $scope.$storage.currentDayProgress)];
			$scope.min = 0;
			$scope.max = parseInt(data.data[0].weeklyGoal) + 2000;
			$scope.$storage.goal.weeklyGoal = parseInt(data.data[0].weeklyGoal);
      
			// console.log("Weekly goal: " + $scope.$storage.goal.weeklyGoal);
			// console.log("Pulling: " + data.data[0].weeklyGoal);
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
      
      // console.log("Weekly goal: " + $scope.$storage.goal.weeklyGoal);
      // console.log("Pulling: " + data.data[0].weeklyGoal);
    },function(data, status, headers, config)  {
      console.log('fail here');
    });

  }
	$scope.getCurrentProgress();
	$scope.callGetGoals();
	$scope.callGetTactics();


	$scope.switch = function (num) {
		if (num == 0)  {
			$scope.data = [$scope.$storage.currentDayProgress, ($scope.$storage.goal.dailyGoal - $scope.$storage.currentDayProgress)];
		} else {
			$scope.data = [$scope.$storage.currentWeekProgress, ($scope.$storage.goal.weeklyGoal - $scope.$storage.currentWeekProgress)];
			$scope.data = [400, $scope.$storage.goal.weeklyGoal];
      $scope.weeklyData = $scope.data = [.15*$scope.$storage.goal.weeklyGoal,.2*$scope.$storage.goal.weeklyGoal,
                          .3*$scope.$storage.goal.weeklyGoal,.5*$scope.$storage.goal.weeklyGoal,
                          .6*$scope.$storage.goal.weeklyGoal,.4*$scope.$storage.goal.weeklyGoal,
                          .3*$scope.$storage.goal.weeklyGoal]; //FIX THIS

		}
	}

	//$scope.data = [$scope.$storage.currentDayProgress, ($scope.$storage.goal.dailyGoal - $scope.$storage.currentDayProgress)];
});

function Goal($http)  {
	var dailyGoal = 2000;
	var weeklyGoal = 10000;
  var weekGoal = 10000;

	$http.get("/goals")
	.then(function(data, status, headers, config)  {
		dailyGoal = parseInt(data.data[0].dailyGoal);
		weeklyGoal = parseInt(data.data[0].weeklyGoal);
	},function(data,status,headers,config)  {
		console.log('fail hur');
	});

	this.__defineGetter__("dailyGoal", function () {
        return dailyGoal;
    });

    this.__defineSetter__("dailyGoal", function (val) {        
        val = parseInt(val);
        dailyGoal = val;
    });

    this.__defineGetter__("weeklyGoal", function () {
        return weeklyGoal;
    });

    this.__defineSetter__("weeklyGoal", function (val) {        
        val = parseInt(val);
        weeklyGoal = val;
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
	$('.tacticalGoalsInput').prop("disabled", function(i, v) { return !v; });
}

$( "#clickme" ).click(function() {
      $( "#book" ).toggle( {
        
      });
    $(this).text(function(i, text){
    return text === "Add" ? "Remove" : "Add";
    })
});





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
