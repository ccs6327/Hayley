angular.module('hayleyService', [])
	.factory('dbServices', function ($http) {
		return {
			addUser : function (userDetail) {
				console.log(userDetail);
				return $http.post('/apis/addUser', userDetail);
			},

			getResponse : function () {
				console.log('hello');
				return $http.get('/apis/getResponse');
			}
		}
	});