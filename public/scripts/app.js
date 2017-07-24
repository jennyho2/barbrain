var app = angular.module("goalsApp", ["ngRoute"]);

app.controller('mainController', function($scope)  {
	$scope.staff = '';
	$scope.openStaff = function(staff) {
		// set data
		$scope.staff = staff;
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





