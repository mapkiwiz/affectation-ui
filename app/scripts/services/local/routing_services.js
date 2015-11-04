 'use strict';

angular.module('ihmApp')
  .factory('IsochroneService', ['$http', '$cacheFactory',
        function ($http, $cacheFactory) {
            
            var isochrone = function(gid, callback) {
                // var $httpDefaultCache = $cacheFactory.get('$http');
                // if (force) {
                //   $httpDefaultCache.removeAll();
                // }
                return $http.get('data/isochrones/iso_20m_' + gid + '.geojson', {
                    cache: true
                }).then(function(value) {
                    callback(value.data);
                });
            };

            return isochrone;

        }
    ]);