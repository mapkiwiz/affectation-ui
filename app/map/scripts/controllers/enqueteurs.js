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
            return {
                getEntities: getEntities,
                entities: function () {
                    return partials;
                }
            };
        }
    ])
  .controller('EnqueteursCtrl', ['$scope', '$window', '$location', '$anchorScroll', 'MapService', 'EnqueteursService',
    function($scope, $window, $location, $anchorScroll, MapService, service) {
        var map = MapService.getMap();
        $scope.selected = undefined;
        $scope.$watch(service.entities, function(newValue, oldValue) {
            if (newValue) {
                $scope.enqueteurs = newValue.features;
                $scope.layer = $window.L.geoJson(newValue, {
                    onEachFeature: function(feature, marker) {
                        marker.on('click', function(e) {
                            $scope.$apply('selected = ' + feature.properties.gid);
                            $location.hash('enqueteur' + feature.properties.gid);
                            $anchorScroll();
                        });
                        marker.bindPopup(feature.properties.prenom);
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
                map.fitBounds($scope.layer.getBounds());
                MapService.setOverlay('enqueteurs', $scope.layer);
            }
        });
        $scope.selectItem = function(entity) {
            // angular.element(e.target).siblings().removeClass("selected");
            // angular.element(e.target).toggleClass("selected");
            $scope.selected = entity.properties.gid;
            $location.hash('enqueteur' + entity.properties.gid);
            map.panTo({ lon: entity.properties.lon, lat: entity.properties.lat });
            entity.properties.marker.bounce({ duration: 1500, height: 120 });
        };
        this.getLayer = function() {
            return $scope.layer;
        };
        service.getEntities();
    }
  ]);