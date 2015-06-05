'use strict';

angular.module('civisanalysisApp')
  .controller('MainCtrl', function ($scope, $http) {
    $scope.rollCalls = [];

	var lt = new Date().toISOString().substr(0,10);

	var gte = new Date();
		gte.setMonth(gte.getMonth()-1)
		gte= gte.toISOString().substr(0,10);

    $http.get('/api/rollcalls?date[gte]='+gte+'&date[lt]='+lt).success(function(rollCalls) {
      $scope.rollCalls = rollCalls;
    });

  });
