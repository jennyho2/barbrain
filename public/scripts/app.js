var app = angular.module("goalsApp", ["ngRoute", "ngStorage", "filters.stringUtils"]);

app.controller('mainController', function($scope, $localStorage, $sessionStorage)  {
	$scope.storage = $localStorage;
	//$scope.storage.staff = '';
	$scope.openStaff = function(staff) {
		// set data
		$scope.storage.staff = staff;
		location.href = '#!staff';
	};




});

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
  .when("/setGoal", {
  	templateUrl : "partials/setGoal.html"
  })
  .when("/adjustStaffGoals", {
    templateUrl : "partials/adjustStaffGoals.html"
  })
  .when("/weeklyGoals", {
  	templateUrl : "partials/weeklyGoals.html"
  })
  .when("/daily", {
    templateUrl : "partials/setDailyGoals.html"
  })
  ;
  
  

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


function enableInput()  {
	$('#tacticalGoalsInput').prop("disabled", function(i, v) { return !v; });
}



