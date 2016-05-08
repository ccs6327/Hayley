angular.module('hayleyController', [])
	.controller('mainController', function ($scope, $http, dbServices) {
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
		}

		dbServices.getResponse()
			.success(function (res) {
				for (index in res) {
					var r = res[index];
					if ($scope.qnIDs.indexOf(r.question_id) == -1) {
						$scope.qnIDs.push(r.question_id);
						var newRes = {
								'question': r.question,
								'yes_users': [],
								'no_users': []
						}
						$scope.responses.push(newRes);
					}
					var pos = $scope.qnIDs.indexOf(r.question_id);
					if (r.response == 0) {
						$scope.responses[pos]['yes_users'].push(r.username);
					} else {
						$scope.responses[pos]['no_users'].push(r.username);
					}
				}
			})
	})