'use strict';

/**
 * @ngdoc overview
 * @name ihmApp
 * @description
 * # ihmApp
 *
 * Main module of the application.
 */
angular
  .module('ihmApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.bootstrap'
  ])
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'EnqueteurPanelCtrl',
        controllerAs: 'main'
      })
      .when('/list', {
        templateUrl: 'views/lists.html',
        controller: 'ListCtrl',
        controllerAs: 'list'
      })
      .when('/import', {
        templateUrl: 'views/import.html',
        controller: 'ImportCtrl',
        controllerAs: 'import'
      })
      .when('/help', {
        templateUrl: 'views/help.html',
      })
      .when('/assign', {
        templateUrl: 'views/assign.html',
        controller: 'AssignCtrl',
        controllerAs: 'assign'
      })
      .otherwise({
        redirectTo: '/'
      });
    // configure html5 to get links working on jsfiddle
    $locationProvider.html5Mode(true);
  });
