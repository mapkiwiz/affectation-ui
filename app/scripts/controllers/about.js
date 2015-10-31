'use strict';

/**
 * @ngdoc function
 * @name ihmApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the ihmApp
 */
angular.module('ihmApp')
  .controller('AboutCtrl', function ($scope) {
  	$scope.title = "AboutTitle";
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
