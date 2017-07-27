var app = angular.module("goalsApp", ["ngRoute", "ngStorage", "filters.stringUtils", "angularModalService"]);

app.controller('mainController', function($scope, $localStorage, $sessionStorage, $http)  {
	$scope.$storage = $localStorage;
	$scope.$storage.dailyGoal = new DailyGoal($http);
	//$scope.$storage.dailyGoal = new DailyGoal($http);
	//$scope.storage.staff = '';
	$scope.openStaff = function(staff) {
		// set data
		$local.$storage.staff = staff;
		location.href = '#!staff';
	};
	
	$scope.callUpdateGoals = function()  {
		var newGoal = $('#weeklyGoalInput').val();
		$http.post("/updateGoals", 
			{
				"location": "10 Barrel Boise",
				"dailyGoal": newGoal,
				"weeklyGoal": "5,000"
		})
		.then(function(data,status,headers,config)  {
			console.log("new goal: " + newGoal);
			$scope.$storage.dailyGoal.value = parseInt(newGoal);
			//$scope.dailyGoal = $storage.dailyGoal;
		}, function(data,status,headers,config)  {
			console.log("failure");
		});
	}

	$scope.callGetGoals = function()  {
		$http.get("/goals")
		.then(function(data,status,headers,config) {

			// if (!$scope.$storage.dailyGoal)  {
			 	$scope.$storage.dailyGoal.value = parseInt(data.data[0].dailyGoal);	
			// }
			
			$scope.min = 0;
			$scope.max = 5000;
			$scope.weeklyGoal = data.data[0].weeklyGoal;
		},function(data, status, headers, config)  {
			console.log('fail');
		});
	}

	$scope.callGetGoals();

});

function DailyGoal($http)  {
	var value = 2000;

	$http.get("/goals")
	.then(function(data, status, headers, config)  {
		value = parseInt(data.data[0].dailyGoal);
		console.log(value);
	},function(data,status,headers,config)  {
		console.log('fail');
	});

	this.__defineGetter__("value", function () {
        return value;
    });

    this.__defineSetter__("value", function (val) {        
        val = parseInt(val);
        value = val;
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
	$('#tacticalGoalsInput').prop("disabled", function(i, v) { return !v; });
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
