/**
* Copyright © 2019 contains code contributed by Orange SA, authors: Denis Barbaron - Licensed under the Apache license 2.0
**/

require('./debugLog.css')

module.exports = angular.module('stf.debugLog', [

])
  .config(function($routeProvider) {
    $routeProvider
      .when('/debugLog', {
        template: require('./debugLog.pug')
      })
  })
  .controller('debugLogCtrl', require('./debugLog-controller'))
