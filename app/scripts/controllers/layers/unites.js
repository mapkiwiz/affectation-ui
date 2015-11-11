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
                setEntities: function(collection) {
                    partials = collection;
                },
                entities: function () {
                    return partials;
                }
            };
        }
    ])
    .controller('UnitesLayerCtrl', ['$rootScope', '$scope', '$window', 'MapContext', 'UnitesService',
    	function($rootScope, $scope, $window, mapcontext, service) {

    		var map = mapcontext.getMap();

    		$scope.status = function(feature, enqueteur_id) {
    			if (enqueteur_id) {
					if (feature.properties.enqueteur) {
						if (feature.properties.enqueteur == enqueteur_id) {
							return "us-marker us-marker-selected";
						} else {
							return "us-marker us-marker-assigned-other";
						}
					} else {
						return "us-marker us-marker-unassigned";
					}
				} else {
					if (feature.properties.enqueteur) {
						return "us-marker us-marker-assigned-other";
					} else {
						return "us-marker us-marker-unassigned";
					}
				}
    		};

    		$scope.featureToMarker = function(feature, latlng, enqueteur_id) {
    			var smallIcon = $window.L.divIcon({
                    className: $scope.status(feature, enqueteur_id),
                    html: '<span class="glyphicon glyphicon-record"></span>',
                    iconSize: $window.L.point(20, 20),
                    //iconAnchor: $window.L.point(0, 30)
                });
                return $window.L.marker(latlng, {icon: smallIcon});
    		};
    		
    		$scope.drawLayer = function(enqueteur_id) {
    			if (!$scope.unites) {
    				return;
    			}
    			if ($scope.layer) {
    				map.removeLayer($scope.layer);
    			}
    			$scope.layer = $window.L.geoJson($scope.unites, {
            		pointToLayer: function(feature, latlng) {
		                return $scope.featureToMarker(feature, latlng, enqueteur_id);
		            },
		            onEachFeature: function(feature, marker) {
		            	if (enqueteur_id) {
			            	marker.on('click', function click(event) {
			            		$scope.layer.removeLayer(this);
			            		if (feature.properties.enqueteur == enqueteur_id) {
			            			feature.properties.enqueteur = undefined;
                                    $rootScope.$broadcast('task.reassigned', {
                                        entity: feature,
                                        wasAssignedTo: enqueteur_id,
                                        assignedTo: undefined });
			            		} else {
                                    var previous_enqueteur = feature.properties.enqueteur;
			            			feature.properties.enqueteur = enqueteur_id;
                                    $rootScope.$broadcast('task.reassigned', {
                                        entity: feature,
                                        wasAssignedTo: previous_enqueteur,
                                        assignedTo: enqueteur_id });
			            		}
			            		var newmarker = $scope.featureToMarker(feature, this.getLatLng(), enqueteur_id);
			            		newmarker.addTo($scope.layer);
			            		newmarker.on('click', click);
			            		$scope.$apply();
			            	});
			            }
			            feature.properties.marker = marker;
		            }
            	});
            	$scope.layer.addTo(map);
            	mapcontext.setOverlay('unites', $scope.layer);
    		};
    		
    		$scope.$watch(service.entities,
    			function(newValue, oldValue) {
		        	if (newValue) {
		            	$scope.unites = newValue;
		            	$scope.drawLayer();
		            	$scope.$emit('map.data.loaded');
		            }
		        }
		    );
		    
		    $scope.$on('enqueteur.selected', function(event, gid) {
	    		$scope.drawLayer(gid);
		    });

            $scope.$on('assignment.changed', function() {
                $scope.drawLayer();
            })
		    
		    service.getEntities();
    	
    	}
    ]);