'use strict';

/**
 * @ngdoc function
 * @name ihmApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the ihmApp
 */
angular.module('ihmApp')
  .controller('MapCtrl', ['$scope', '$window', function ($scope, $window) {
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
    	{ name: "Daisy" },
    	{ name: "Alice" },
    	{ name: "Bob" },
    	{ name: "Charles" },
    	{ name: "Daisy" },
    	{ name: "Alice" },
    	{ name: "Bob" },
    	{ name: "Charles" },
    	{ name: "Daisy" },
    	{ name: "Alice" },
    	{ name: "Bob" },
    	{ name: "Charles" },
    	{ name: "Daisy" }
    ];
    $scope.selectItem = function(e) {
    	angular.element(e.target).siblings().removeClass("selected");
    	angular.element(e.target).toggleClass("selected");
    };
    $scope.setBaseMap = function(basemap) {
    	$scope.map.removeLayer($scope.basemap.layer);
    	basemap.layer.addTo($scope.map);
    	$scope.basemap = basemap;
    };
    $scope.init = function() {
    	var map = $window.L.map("map");
    	$scope.basemaps = {
    		toner: {
    			layer: $window.L.tileLayer("//stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png"),
    			label: "Stamen Toner" },
    		lite: {
    			layer: $window.L.tileLayer("//stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png"),
    			label: "Stamen Toner Lite"},
    		osm: {
    			layer: $window.L.tileLayer("//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"),
    			label: "Open Street Map" }
    	};
    	$scope.basemap = $scope.basemaps.lite;
    	$scope.basemaps.lite.layer.addTo(map);
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
