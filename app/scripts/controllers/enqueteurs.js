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
            // var findEntity = function (gid) {
            //     if (partials) {
            //         for (var f in partials.features) {
            //             if (f.properties.gid == gid) {
            //                 return f;
            //             }
            //         }
            //     }
            //     return undefined;
            // };
            return {
                getEntities: getEntities,
                entities: function () {
                    return partials;
                }
                // findEntity: findEntity
            };
        }
    ])
  .controller('EnqueteursCtrl', ['$scope', '$window', '$location', '$anchorScroll', 'MapContext', 'EnqueteursService', 'IsochroneService',
    function($scope, $window, $location, $anchorScroll, mapcontext, service, isochrone) {
        var map = mapcontext.getMap();
        $scope.selected = undefined;
        $scope.$watch(service.entities, function(newValue, oldValue) {
            if (newValue) {
                $scope.enqueteurs = newValue.features;
                $scope.layer = $window.L.geoJson(newValue, {
                    onEachFeature: function(feature, marker) {
                        marker.on('click', function(e) {
                            $scope.$emit('enqueteur.selected', feature.properties.gid, false);
                            $scope.$apply();
                        });
                        marker.bindPopup(feature.properties.prenom, {
                            closeButton: false
                        });
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
        $scope.selectItem = function(entity) {
            // angular.element(e.target).siblings().removeClass("selected");
            // angular.element(e.target).toggleClass("selected");
            $scope.$emit('enqueteur.selected', entity.properties.gid, true);
            entity.properties.marker.bounce({ duration: 1500, height: 120 });
        };
        $scope.findEntity = function (gid) {
            if ($scope.enqueteurs) {
                for (var i in $scope.enqueteurs) {
                    if ($scope.enqueteurs[i].properties.gid == gid) {
                        return $scope.enqueteurs[i];
                    }
                }
            }
            return undefined;
        };
        $scope.$on('enqueteur.selected', function(event, gid, pan) {
            var feature = $scope.findEntity(gid);
            if (feature) {
                $scope.selected =  gid;
                $location.hash('enqueteur' + gid);
                if (pan) {
                    map.panTo({ lon: feature.properties.lon, lat: feature.properties.lat });
                }
                isochrone(feature.properties.lon, feature.properties.lat, 20000, function(data) {
                // isochrone(feature.properties.gid, function(data) {
                    if ($scope.isochrone) {
                        map.removeLayer($scope.isochrone);
                    }
                    $scope.isochrone = $window.L.geoJson(data);
                    $scope.isochrone.addTo(map);
                });
                $anchorScroll();
            }
        });
        this.getLayer = function() {
            return $scope.layer;
        };
        service.getEntities();
    }
  ]);