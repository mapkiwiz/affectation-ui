'use strict';

angular.module('ihmApp')
	.factory('UnitesService', ['$http', '$cacheFactory',
        function UnitesService($http, $cacheFactory) {
            var partials = null;
            var $httpDefaultCache = $cacheFactory.get('$http');
            var getEntities = function (force) {
                if (force) {
                    $httpDefaultCache.removeAll();
                }
                return $http.get('data/us.geojson', {cache: true}).then(function (value) {
                    partials = value.data;
                });
            };
            return {
                getEntities: getEntities,
                entities: function () {
                    return partials;
                }
            };
        }
    ])
    .controller('UnitesCtrl', ['$scope', '$window', 'MapService', 'UnitesService',
    	function($scope, $window, MapService, service) {
    		$scope.$watch(service.entities,
    			function(newValue, oldValue) {
		        	if (newValue) {
		            	$scope.unites = newValue.features;
		            	$scope.layer = $window.L.geoJson(newValue, {
		            		pointToLayer: function(feature, latlng) {
				                var smallIcon = $window.L.divIcon({
				                    className: "us-marker",
				                    html: '<span class="glyphicon glyphicon-record"></span>',
				                    iconSize: $window.L.point(20, 20),
				                    //iconAnchor: $window.L.point(0, 30)
				                });
				                return $window.L.marker(latlng, {icon: smallIcon});
				            },
		            	});
		            	var map = MapService.getMap();
		            	$scope.layer.bindPopup('US').addTo(map);
		            	map.fitBounds($scope.layer.getBounds());
		            	MapService.setOverlay('unites', $scope.layer);
		            }
		        }
		    );
		    service.getEntities();
    	}
    ]);