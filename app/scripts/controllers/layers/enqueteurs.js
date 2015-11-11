'use strict';

angular.module('ihmApp')

  .factory('EnqueteursService', ['$http', '$cacheFactory',
        function EnqueteursService($http, $cacheFactory) {

            var partials = null;
            var $httpDefaultCache = $cacheFactory.get('$http');

            var getEntities = function (force) {
                if (force) {
                    $httpDefaultCache.removeAll();
                }
                return $http.get('data/enqueteurs.geojson', {cache: true}).then(function (value) {
                    partials = value.data;
                });
            };

            var findEntity = function (gid) {
                if (partials) {
                    for (var f in partials.features) {
                        if (partials.features[f].properties.gid == gid) {
                            return partials.features[f];
                        }
                    }
                }
                return undefined;
            };

            return {
                selectionId: undefined,
                getEntities: getEntities,
                entities: function () {
                    return partials;
                },
                setEntities: function(collection) {
                    partials = collection;
                },
                findEntity: findEntity,
                selected: function() {
                    if (this.selectionId) {
                        return this.findEntity(this.selectionId);
                    } else {
                        return undefined;
                    }
                }
            };

        }
    ])

  .controller('EnqueteursLayerCtrl',
    [ '$rootScope',
      '$scope',
      '$window',
      '$location',
      '$anchorScroll',
      'MapContext',
      'EnqueteursService',
      'IsochroneService',
    function($rootScope, $scope, $window, $location, $anchorScroll, mapcontext, service, isochrone) {
        
        var map = mapcontext.getMap();

        var updateWorkerIndex = function(features) {
            $scope.workerIndex = {};
            angular.forEach(features, function(feature) {
                $scope.workerIndex[feature.properties.gid] = feature; 
            });
        };
        
        $scope.$watch(service.entities, function(newValue, oldValue) {
            if (newValue) {
                $scope.enqueteurs = newValue.features;
                updateWorkerIndex(newValue.features);
                $scope.layer = $window.L.geoJson(newValue, {
                    onEachFeature: function(feature, marker) {
                        marker.on('click', function(e) {
                            $rootScope.$broadcast('enqueteur.selected', feature.properties.gid, false, true);
                            $scope.$apply();
                        });
                        // marker.bindPopup(feature.properties.prenom, {
                        //     closeButton: false
                        // });
                        feature.properties.marker = marker;
                    }
                });
                //  , {
                //  pointToLayer: function(feature, latlng) {
                   //      var smallIcon = L.divIcon({
                   //          className: "enqueteurs-marker",
                   //          html: '<span class="glyphicon glyphicon-record"></span>',
                   //          iconSize: $window.L.point(20, 20),
                   //          //iconAnchor: $window.L.point(0, 30)
                   //      });
                   //      return $window.L.marker(latlng, {icon: smallIcon});
                   //  },
                // });
                $scope.layer.addTo(map);
                $scope.$emit('map.data.loaded');
                mapcontext.setOverlay('enqueteurs', $scope.layer);
            }
        });

        $scope.$on('enqueteur.selected', function(event, gid, pan, scroll) {
            var feature = service.findEntity(gid);
            if (feature) {
                service.selectionId =  gid;
                if (pan) {
                    map.panTo({ lon: feature.properties.lon, lat: feature.properties.lat });
                }
                // isochrone(feature.properties.lon, feature.properties.lat, 20000, function(data) {
                isochrone(feature.properties.gid, function(data) {
                    if ($scope.isochrone) {
                        map.removeLayer($scope.isochrone);
                    }
                    $scope.isochrone = $window.L.geoJson(data);
                    $scope.isochrone.addTo(map);
                });
                if (scroll) {
                    $anchorScroll('enqueteur' + gid);
                }
            }
        });

        $scope.$on('task.reassigned', function(event, params) {
            if (params.wasAssignedTo) {
                var worker = $scope.workerIndex[params.wasAssignedTo];
                worker.properties.load = worker.properties.load - 1;
            }
            if (params.assignedTo) {
                var worker = $scope.workerIndex[params.assignedTo];
                worker.properties.load = worker.properties.load + 1;
            }
        });

        this.getLayer = function() {
            return $scope.layer;
        };

        $scope.init = function() {
            service.getEntities();
        };

        $scope.init();

    }
  ]);