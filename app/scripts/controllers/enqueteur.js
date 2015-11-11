'use strict';

/**
 * @ngdoc function
 * @name ihmApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the ihmApp
 */
angular.module('ihmApp')
  .controller('EnqueteurPanelCtrl', ['$scope', 'EnqueteursService', 'UnitesService', function ($scope, enqueteurs, unites) {
      
  		$scope.update = function() {
  			$scope.unites = [];
  			var entities = unites.entities();
  			if ($scope.selected && entities) {
  				for (var i in entities.features) {
  					var u = entities.features[i];
  					if (u.properties.enqueteur === $scope.selected.properties.gid) {
  						$scope.unites.push(u);
  					}
  				}
  			}
  		};

  		$scope.$watch(
  			function() {
  				return enqueteurs.selectionId;
  			},
  			function(newId) {
	  			if (newId) {
	  				$scope.selected = enqueteurs.selected();
	  				$scope.update();
	  			}
  			}
  		);

  		// $scope.$on('task.reassigned', function() {
  		// 	$scope.update();
  		// })

    }
  ]);

  									