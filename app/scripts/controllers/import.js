'use strict';

/**
 * @ngdoc function
 * @name ihmApp.controller:ImportCtrl
 * @description
 * # ImportCtrl
 * Controller of the ihmApp
 * 
 * @see
 * http://stackoverflow.com/questions/28070374/parsing-a-csv-file-provided-by-an-input-in-angular
 */
angular.module('ihmApp')

	.directive('fileChange',['$parse', function($parse){
	  return{
	    require:'ngModel',
	    restrict:'A',
	    link:function($scope,element,attrs,ngModel){
	      var attrHandler=$parse(attrs['fileChange']);
	      var handler=function(e){
	        $scope.$apply(function(){
	          attrHandler($scope,{$event:e,files:e.target.files});
	        });
	      };
	      element[0].addEventListener('change',handler,false);
	    }
	  }
	}])

    .filter('csvToGeojson', function() {

      var valToObj = function(values, header) {

        if (values) {
            var obj = {};
            for (var i=0; i<Math.min(values.length, header.length); i++) {
                obj[header[i]] = values[i];
            }
            return obj;
        } else {
            return null;
        }

      };

      return function(input) {

        var separator = ",";
        var rows = input.split('\n');
        var header = rows.shift().trim().split(separator);
        var features = [];

        angular.forEach(rows, function(val){

          var obj = valToObj(val.trim().split(separator), header);

          if (obj && obj.task) {
            features.push({
                type: "Feature",
                properties: {
                    gid: parseInt(obj.task),
                    group: obj.group && parseInt(obj.group) || undefined,
                    enqueteur: obj.worker && parseInt(obj.worker) || undefined,
                    lon: parseFloat(obj.lon),
                    lat: parseFloat(obj.lat)
                },
                geometry: {
                    type: 'Point',
                    coordinates: [ parseFloat(obj.lon), parseFloat(obj.lat) ]
                }
              });
          }

        });

        return { type: "FeatureCollection", features: features };

      };
    })

	.controller('ImportCtrl', ['$scope', '$filter', 'UnitesService', function($scope, $filter, service) {

			$scope.handler = function(event, files) {
                var reader = new FileReader();
                reader.onload = function(e){
                    var string = reader.result;
                    var obj = $filter('csvToGeojson')(string);
                    service.setEntities(obj);
                    $scope.$apply();
                }
                console.log(files[0]);
                reader.readAsText(files[0]);
			};

		}
	]);