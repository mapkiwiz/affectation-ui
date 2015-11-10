'use strict';

/**
 * Main module of the application.
 */
angular
  .module('ihmApp')
  .controller('MainCtrl', [ '$scope', '$window', 'UnitesService',
      function($scope, $window, service) {

          $scope.exportCSV = function() {

              var tasks = service.entities().features;
              var data = ['task,group,worker,lon,lat\n'];
              angular.forEach(tasks, function(task) {
                var row = [
                    task.properties.gid,
                    0,
                    task.properties.enqueteur,
                    task.properties.lon,
                    task.properties.lat ];
                data.push(row.join(',') + '\n');
              });

              var blob = new Blob(data, {
                    type: "text/csv;charset=utf-8;"
                  });
              var fileName = 'affectations.csv';

              if ($window.navigator.msSaveOrOpenBlob) {

                $window.navigator.msSaveBlob(blob, fileName);

              } else {

                var document = $window.document;
                var downloadLink = document.createElement("a");
                downloadLink.href = $window.URL.createObjectURL(blob);
                downloadLink.download = fileName;

                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);

              }

          };
      }
  ]);