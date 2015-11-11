'use strict';

/**
 * @ngdoc function
 * @name ihmApp.controller:AssignCtrl
 * @description
 * # AssignCtrl
 * Automatically compute a best assignment  
 */
angular.module('ihmApp')

  .factory('DistanceService', ['$window', function($window) {

      var latlon = $window.L.latLng;

      return function(a, b) {
        
        var aLatLng = latlon(a.coordinates[1], a.coordinates[0]);
        var bLatLng = latlon(b.coordinates[1], b.coordinates[0]);
        
        return aLatLng.distanceTo(bLatLng);

      };

    }
  ]) // DistanceService

  .factory('PointInPolygon', [ function() {

      return function(point, polygon) {
        
        var nodes = polygon.coordinates[0].length;

        var node = function(i) {
          return {
            lon: polygon.coordinates[0][i][0],
            lat: polygon.coordinates[0][i][1]
          };
        };

        var cross = function(a, b, c) {
          var bx = b.lon - a.lon;
          var by = b.lat - a.lat;
          var cx = c.lon - a.lon;
          var cy = c.lat - a.lat;
          return (bx * cy - by * cx);
        };

        var p = {
          lon: point.coordinates[0],
          lat: point.coordinates[1]
        };
    
        // if ((nodes < 2) || !(path.get(0).equals(path.get(nodes-1))))
        //   throw new IllegalArgumentException("Path is not closed");
        
        var windingNumber = 0;
        
        for (var i=0; i<nodes-1; i++) {
          var e1 = node(i);
          var e2 = node(i+1);
          if (e1.lat <= p.lat) {
            if (e2.lat > p.lat) {
              if (cross(e1, e2, p) > 0) { // p left of edge (e1, e2)
                windingNumber++;
              }
            }
          } else {
            if (e2.lat <= p.lat) {
              if (cross(e1, e2, p) < 0) { // p right of edge (e1, e2)
                windingNumber--;
              }
            }
          }
        }
        
        return (windingNumber !== 0);

      };

    }
  ]) // PointInPolygon

  .service('AssignAlgo', [ 'DistanceService', 'PointInPolygon',

    function(distance, pointInPolygon) {

      var AssignAlgo = function() {

        this.minAssignedCapacity = 2;
        this.defaultCapacity = 10;
      
      };

      AssignAlgo.prototype.distanceMatrix = function(workers, tasks) {

        var matrix = [];
        angular.forEach(workers, function(worker) {

          var accessiblePolygon = worker.properties.isochrone;
          var row = [];

          angular.forEach(tasks, function(task) {

            if (accessiblePolygon && pointInPolygon(task.geometry, accessiblePolygon)) {
            
              var d = distance(worker.geometry, task.geometry);  
              row.push(d);

            } else {
              
              row.push(Infinity);
            
            }

          });

          matrix.push(row);

        });

        return matrix;

      };

      AssignAlgo.prototype.costMatrix = function(distanceMatrix, workers) {

        var matrix = [];

        for (var w=0; w<distanceMatrix.length; w++) {
          var row = [];
          var capacity = workers[w].properties.capacity;
          for (var t=0; t<distanceMatrix[w].length; t++) {
            var cost = this.costNewlyAssigned(distanceMatrix, w, t, capacity);
            row.push(cost);
          }

          matrix.push(row);
        }

        return matrix;

      };

      AssignAlgo.prototype.costAlreadyAssigned = function(distanceMatrix, w, t, capacity) {

        if (capacity <= 0) {
          return Math.pow(distanceMatrix[w][t], 2) / this.minAssignedCapacity;
        } else {
          return Math.pow(distanceMatrix[w][t], 2) / (1.25*capacity);
        }

      };

      AssignAlgo.prototype.costNewlyAssigned = function(distanceMatrix, w, t, capacity) {
        
        if (capacity <= 0) {
          return Infinity;
        } else {
          return Math.pow(distanceMatrix[w][t], 2) / capacity;
        }

      };

      AssignAlgo.prototype.assign = function(workers, tasks, options) {

        var t,w;

        var defaultCapacity = options && options.defaultCapacity || this.defaultCapacity;
        for (w=0; w<workers.length; w++) {
          workers[w].properties.load = 0;
          workers[w].properties.capacity = workers[w].properties.capacity || defaultCapacity;
        }

        // 1. compute distance matrix and initial cost matrix
        console.log("Computing distance matrix");
        var distanceMatrix = this.distanceMatrix(workers, tasks);
        console.log("Computing cost matrix");
        var costMatrix = this.costMatrix(distanceMatrix, workers);
        
        // 2. optimize assignment
        
        var maxIteration = 10;
        // current iteration
        var k = 0;
        var assignment = [];

        for (t=0; t<tasks.length; t++) {
          assignment[t] = undefined;
        }

        var leftCapacity = function(worker) {
          return  worker.properties.capacity - worker.properties.load;
        };

        while (k < maxIteration) {

          console.log("Iteration " + k);
          var changed = 0;
          var selectedWorker;

          // iterate over tasks
          for (t=0; t<tasks.length; t++) {
            
            var minCost = Infinity;
            selectedWorker = undefined;
            
            // find worker with min cost for task t
            for (w=0; w<workers.length; w++) {
              var cost = costMatrix[w][t];
              if (cost < minCost) {
                minCost = cost;
                selectedWorker = w;
              }
            }

            if (selectedWorker !== undefined) {

              var previousWorker = assignment[t];

              if (selectedWorker !== previousWorker) {

                changed++;
                assignment[t] = selectedWorker;
                workers[selectedWorker].properties.load = workers[selectedWorker].properties.load + 1;
                if (previousWorker !== undefined) {
                  workers[previousWorker].properties.load = workers[previousWorker].properties.load - 1;
                }
                
                // update cost matrix
                for (var kt=0; kt<tasks.length; kt++) {

                  if (previousWorker !== undefined) {
                    costMatrix[previousWorker][kt] = this.costNewlyAssigned(
                        distanceMatrix,
                        previousWorker,
                        kt,
                        leftCapacity(workers[previousWorker]));
                  }

                  costMatrix[selectedWorker][kt] = this.costAlreadyAssigned(
                      distanceMatrix,
                      selectedWorker,
                      kt,
                      leftCapacity(workers[selectedWorker]));

                }

              }
            
            }

          } // end iterate over tasks

          if (changed === 0) {
            break;
          }

          // next iteration
          k++;

        }

        console.log("Done");
        return assignment;

      };

      return AssignAlgo;

    }
  ]) // AssignAlgo

  .controller('AssignCtrl', [ '$rootScope', '$scope', '$q', 'EnqueteursService', 'UnitesService', 'IsochroneService', 'AssignAlgo',
    function($rootScope, $scope, $q, workerStore, taskStore, isochrone, Algo) {

      $scope.mustConfirmBeforeProcess = true;

      $scope.computeAssignment = function() {

        var workers = workerStore.entities();
        var tasks = taskStore.entities();
        var promises = [];

        angular.forEach(workers.features, function(worker) {
          promises.push(
            // TODO use point and max distance
            isochrone(worker.properties.gid, function(value) {
              // console.log("Got isochrone for " + worker.properties.nom);
              worker.properties.isochrone = value;
            })
          );
        });

        var run = function() {

          var algo = new Algo();
          var assignment = algo.assign(workers.features, tasks.features);
          var assignedTasks = 0;
          var hiredWorkers = 0;
          var hired = {};

          for (var t=0; t<tasks.features.length; t++) {
            if (assignment[t] !== undefined) {
              var w = workers.features[assignment[t]].properties;
              tasks.features[t].properties.enqueteur = w.gid;
              assignedTasks++;
              hired[assignment[t]] = true;
            }
          }

          hiredWorkers = Object.keys(hired).length;
          $scope.assignedTasks = assignedTasks;
          $scope.unassignedTasks = tasks.features.length - assignedTasks;
          $scope.hiredWorkers = hiredWorkers;
          $scope.unusedWorkers = workers.features.length - hiredWorkers;
          $scope.mustConfirmBeforeProcess = true
          $rootScope.$broadcast('assignment.changed');

       };

       $q.all(promises).then(function() {
        run();
       });

      };

      $scope.confirmBeforeProcess = function() {
        $scope.mustConfirmBeforeProcess = false;
      };

      $scope.cancel = function() {
        $scope.mustConfirmBeforeProcess = true;
      };

    }
  ]); // AssignCtrl