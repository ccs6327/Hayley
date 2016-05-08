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

		$scope.addUser = function () {
			dbServices.addUser($scope.userDetail)
				.success(function (data) {
					console.log('adding user...');
				})
				.error(function (data) {
					console.log('error submitting user details: ' + data);
				});
			$scope.userDetail = {'name': null, 'phone': null};
			socket.emit('addUser', $scope.userDetail);
		}

		//refresh page every 1 second
		setInterval(function(){ 
			dbServices.getResponse()
			.success(function (res) {
				for (index in res) {
					var r = res[index];
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
					if (r.response == 0) {
						if ($scope.responses[pos]['yes_users'].indexOf(r.username) == -1) {
						    $scope.responses[pos]['yes_users'].push(r.username);
						}
					} else {
						if ($scope.responses[pos]['no_users'].indexOf(r.username) == -1) {
						    $scope.responses[pos]['no_users'].push(r.username);
						}
					}
				}
			})
		}, 500);
	})

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}