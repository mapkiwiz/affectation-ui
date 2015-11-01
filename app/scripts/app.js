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
      .when('/map', {
        templateUrl: 'map/views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/map/about', {
        templateUrl: 'map/views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .when('/map/test', {
        templateUrl: 'map/views/test.html',
        controller: 'MapCtrl',
        controllerAs: 'test'
      })
      .otherwise({
        redirectTo: '/map'
      });
    // configure html5 to get links working on jsfiddle
    $locationProvider.html5Mode(true);
  });
