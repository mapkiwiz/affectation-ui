'use strict';

/**
 * @ngdoc function
 * @name ihmApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the ihmApp
 */
angular.module('ihmApp')
  .controller('TestCtrl', ['$scope', '$window', function ($scope, $window) {
  	$scope.title = "TestTitle";
    $scope.things = [
      'Test HTML5 Boilerplate',
      'Test AngularJS',
      'Test Karma'
    ];
    $scope.enqueteurs = [
    	{ name: "Alice" },
    	{ name: "Bob" },
    	{ name: "Charles" },
    	{ name: "Daisy" }
    ];
    $scope.selectItem = function(e) {
    	jQuery(e.target).siblings().removeClass("selected");
    	jQuery(e.target).toggleClass("selected");
    };
    $scope.init = function() {
    	var map = $window.L.map("map");
    	var basemaps = {
    		minimal: $window.L.tileLayer("//stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png")
    	};
    	basemaps.minimal.addTo(map);
		var mapView = {
            lat: 45.5,
            lng: 6,
            zoom: 9
        };
        map.setView($window.L.latLng(mapView.lat, mapView.lng), mapView.zoom, true);
        $scope.map = map;
    };
    $scope.init();
  }]);
