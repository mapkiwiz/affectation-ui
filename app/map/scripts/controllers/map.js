'use strict';

/**
 * @ngdoc function
 * @name ihmApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the ihmApp
 */
angular.module('ihmApp')
  .factory('MapService', ['$window',
  	function MapService($window) {
  		var map = $window.L.map("map");
  		var overlays = {};
  		return {
  			getMap: function() {
		        	return map;
		        },
		    setOverlay: function(name, overlay) {
		    	overlays[name] = overlay;
		    },
		    getOverlay: function(name) {
		    	return overlays[name];
		    },
		    getBounds: function() {
		    	var bounds = null;
		    	for (var name in overlays) {
		    		if (bounds) {
		    			bounds.extend(overlays[name].getBounds());
		    		} else {
		    			bounds = overlays[name].getBounds();
		    		}
		    	}
		    	return bounds;
		    }
  		};
  	}
  ])
  .controller('MapCtrl', ['$scope', '$window', 'MapService',
      function ($scope, $window, MapService) {
      	var map = MapService.getMap();
        $scope.title = "TestTitle";
        $scope.overlays = {};
        $scope.setBaseMap = function(basemap) {
            map.removeLayer($scope.basemap.layer);
            basemap.layer.addTo(map);
            $scope.basemap = basemap;
        };
        $scope.fitAll = function() {
        	map.fitBounds(MapService.getBounds());
        };
        $scope.init = function() {
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
