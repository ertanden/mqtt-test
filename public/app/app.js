var app = angular.module('mqttTestApp', ['services', 'ngStorage'])

angular.module('services', []);

app.controller('AppController', function($rootScope, $scope, $log, $sessionStorage, mqttService) {

	$scope.username = $sessionStorage.username;
	$scope.host = $sessionStorage.host;
	$scope.port = $sessionStorage.port;
	$scope.useSSL = $sessionStorage.useSSL;

	$scope.users = {};
	$scope.isConnected = false;

	if($scope.username && $scope.host && $scope.port) {
		mqttService.connect();
	}

	$scope.onConnect = function() {

		$sessionStorage.username = $scope.username;
		$sessionStorage.password = $scope.password;
		$sessionStorage.host = $scope.host;
		$sessionStorage.port = $scope.port;
		$sessionStorage.useSSL = $scope.useSSL;

		mqttService.connect();
	}

	$scope.$on('statusUpdate', function(events, payload) {
		$scope.users[payload.clientId] = payload;
		$scope.$apply();
	});

	$scope.$on('connected', function(events, value) {
		$scope.isConnected = true;
		$scope.$apply();
	});

	$scope.$on('disconnected', function(events, value) {
		$scope.isConnected = false;
		$scope.$apply();
	});
});
