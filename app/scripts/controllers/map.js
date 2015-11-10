'use strict';

/**
 * @ngdoc function
 * @name ihmApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the ihmApp
 */
angular.module('ihmApp')
  .factory('MapContext', ['$window',
  	function ($window) {
  		var map = $window.L.map("map");
  		var overlays = {};
  		var mapView = {
	            lat: 45.5,
	            lng: 6,
	            zoom: 9
	        };
        var basemaps = {
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
  		return {
  			basemap: basemaps.lite,
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
			    },
		    getView: function() {
			    	return mapView;
			    },
		    getBaseMaps: function() {
			    	return basemaps;
			    },
			setBaseMap: function(basemap) {
		            map.removeLayer(this.basemap.layer);
		            basemap.layer.addTo(map);
		            this.basemap = basemap;
		        },
			fitAll: function() {
			 	var bounds = this.getBounds();
			 	if (bounds) {
			 		map.fitBounds(bounds);
			 	}
			 }
  		};
  	}
  ])
  .controller('MapCtrl', ['$rootScope', '$scope', '$window', 'MapContext',
      function ($rootScope, $scope, $window, mapcontext) {
      	var map = mapcontext.getMap();
      	$rootScope.mapcontext = mapcontext;
        $scope.title = "TestTitle";
        $scope.fitAll = function() {
        	mapcontext.fitAll();
        };
        $scope.init = function() {
        	$scope.mapcontext = mapcontext;
            $scope.basemaps = mapcontext.getBaseMaps();
            $scope.basemap = $scope.basemaps.lite;
            $scope.basemaps.lite.layer.addTo(map);
            var mapView = mapcontext.getView();
            map.setView($window.L.latLng(mapView.lat, mapView.lng), mapView.zoom, true);
        };
        $scope.$on('map.data.loaded', function() {
        	mapcontext.fitAll();
        });
        $scope.init();
  }]);
