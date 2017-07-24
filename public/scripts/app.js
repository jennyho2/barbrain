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
  	templateUrl : "staff.html"
  })
  .when("/yesterday", {
  	templateUrl : "partials/yesterday.html"
  })
  .when("/setGoal", {
  	templateUrl : "partials/setGoal.html"
  })
    .when("/adjustStaffGoals", {
    templateUrl : "partials/adjustStaffGoals.html"
  });
  

});

angular.module('filters.stringUtils', [])

.filter('removeSpaces', [function() {
    return function(string) {
        if (!angular.isString(string)) {
            return string;
        }
        return string.replace(/[\s]/g, '');
    };
}])





