var app = angular.module("goalsApp", ["ngRoute", "ngStorage"]);

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
  });
});





