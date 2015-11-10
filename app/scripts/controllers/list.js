'use strict';

/**
 * @ngdoc function
 * @name ihmApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the ihmApp
 */
angular.module('ihmApp')
  .controller('ListCtrl', ['$rootScope', '$scope', 'EnqueteursService',
  	function($rootScope, $scope, service) {

  	$scope.selectItem = function(entity) {
        $rootScope.$broadcast('enqueteur.selected', entity.properties.gid, true);
        entity.properties.marker.bounce({ duration: 1500, height: 120 });
    };

  	$scope.$watch(service.entities,
  		function(newValue) {
	  		if (newValue) {
	 			$scope.enqueteurs = newValue.features; 			
	  		}
  		}
  	);

  	$scope.$watch(function() {
  			return service.selectionId;
	  	},
	  	function(newId) {
	  		$scope.selected = newId;
  		}
  	);

  }
]);