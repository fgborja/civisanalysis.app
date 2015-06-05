'use strict';

angular.module('civisanalysisApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('mainTemplate', {
        url: '/',
        templateUrl: 'app/mainTemplate/mainTemplate.html',
        controller: 'MainTemplateCtrl'
      });
  });