var app = angular.module('hayleyController', []);

app.factory('socket', ['$rootScope', function($rootScope) {
	var socket = io.connect();

  	return {
    	on: function(eventName, callback){
      		socket.on(eventName, callback);
    	},
    	emit: function(eventName, data) {
     		socket.emit(eventName, data);
    	}
	};
}]);

app.controller('mainController', function ($scope, $http, dbServices, socket) {
	$scope.userDetail = {'name': null, 'phone': null};
	$scope.qnIDs = [];
	$scope.responses = [];
	$scope.resIDs = [];

	$scope.addUser = function () {
		dbServices.addUser($scope.userDetail)
			.success(function (data) {
				console.log('adding user...');
			})
			.error(function (data) {
				console.log('error submitting user details: ' + data);
			});
		$scope.userDetail = {'name': null, 'phone': null};
	}

	dbServices.getResponse()
		.success(function (res) {
			for (index in res) {
				var r = res[index];
				$scope.resIDs.push(r.response_id);
				if ($scope.qnIDs.indexOf(r.question_id) == -1) {
					$scope.qnIDs.push(r.question_id);
					var newRes = {
							'question': capitalizeFirstLetter(r.question) + '?',
							'yes_users': [],
							'no_users': []
					}
					$scope.responses.push(newRes);
				}
				var pos = $scope.qnIDs.indexOf(r.question_id);
				if (r.response != 0) {
					$scope.responses[pos]['yes_users'].unshift(r.username);
				} else {
					$scope.responses[pos]['no_users'].unshift(r.username);
				}
			}
			console.log($scope.resIDs);
		})

	socket.on("newData", function() {
		dbServices.getResponse()
			.success(function (res) {
				for (index in res) {
					var r = res[index];
					if ($scope.resIDs.indexOf(r.response_id) == -1) {
						$scope.resIDs.push(r.response_id);
						if ($scope.qnIDs.indexOf(r.question_id) == -1) {
							$scope.qnIDs.push(r.question_id);
							var newRes = {
									'question': capitalizeFirstLetter(r.question) + '?',
									'yes_users': [],
									'no_users': []
							}
							$scope.responses.push(newRes);
						}
						var pos = $scope.qnIDs.indexOf(r.question_id);
						if (r.response != 0) {
							$scope.responses[pos]['yes_users'].unshift(r.username);
						} else {
							$scope.responses[pos]['no_users'].unshift(r.username);
						}
					};
				}
			})
	})
})

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}