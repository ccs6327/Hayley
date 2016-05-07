angular.module('hayleyController', [])
	.controller('mainController', function ($scope, $http, dbServices) {
		$scope.userDetail = {'name': null, 'phone': null};

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
	})