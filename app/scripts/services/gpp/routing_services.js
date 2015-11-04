 'use strict';

angular.module('ihmApp')
  .factory('IsochroneService', ['$http',
        function ($http) {

            var gpp_key = "50bejnu55v5ievgkbvzxas6s";
            var gpp_isochrone_url = "https://wxs.ign.fr/" + gpp_key + "/isochrone/isochrone.json";
            
            var isochrone = function(lon, lat, distance, callback) {
                return $http.get(gpp_isochrone_url, {
                    params: {
                        "location": [lon, lat].join(","),
                        "method": "distance",
                        "holes": "true",
                        "distance": distance,
                        "graphName": "Voiture",
                        "smooth": "false"
                    },
                    headers: {
                        "Referer": "http://geo.agriculture/affectation-demo",
                        "Origin": "http://geo.agriculture/affectation-demo"
                    },
                    cache: false
                }).then(function(value) {
                    callback(value.data);
                });
            };

            return isochrone;

        }
    ]);