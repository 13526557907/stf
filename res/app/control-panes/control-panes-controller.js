/**
* Copyright © 2019 contains code contributed by Orange SA, authors: Denis Barbaron - Licensed under the Apache license 2.0
**/

module.exports =
  function ControlPanesController($scope, $http, gettext, $routeParams,
    $timeout, $location, DeviceService, GroupService, ControlService, $route,$window,
    StorageService, FatalMessageService, SettingsService, UserService) {
    var sharedTabs = [
      {
        title: gettext('Screenshots'),
        icon: 'fa-camera color-skyblue',
        templateUrl: 'control-panes/screenshots/screenshots.pug',
        filters: ['native', 'web']
      },
      // {
      //   title: gettext('Automation'),
      //   icon: 'fa-road color-lila',
      //   templateUrl: 'control-panes/automation/automation.pug',
      //   filters: ['native', 'web']
      // },
      // {
      //   title: gettext('Advanced'),
      //   icon: 'fa-bolt color-brown',
      //   templateUrl: 'control-panes/advanced/advanced.pug',
      //   filters: ['native', 'web']
      // },
      {
        title: gettext('File Explorer'),
        icon: 'fa-folder-open color-blue',
        templateUrl: 'control-panes/explorer/explorer.pug',
        filters: ['native', 'web']
      },
      {
        title: gettext('Info'),
        icon: 'fa-info color-orange',
        templateUrl: 'control-panes/info/info.pug',
        filters: ['native', 'web']
      }
    ]

    $scope.topTabs = [
      {
        title: gettext('Dashboard'),
        icon: 'fa-dashboard fa-fw color-pink',
        templateUrl: 'control-panes/dashboard/dashboard.pug',
        filters: ['native', 'web']
      }
    ].concat(angular.copy(sharedTabs))

    $scope.belowTabs = [
      {
        title: gettext('Logs'),
        icon: 'fa-list-alt color-red',
        templateUrl: 'control-panes/logs/logs.pug',
        filters: ['native', 'web']
      }
    ]

    $scope.device = null
    $scope.control = null

    // TODO: Move this out to Ctrl.resolve
    function getDevice(serial) {
      console.log("序列号",serial)
      DeviceService.get(serial, $scope)
        .then(function(device) {
          console.log("devices====",device);
          console.log(device.display.url);
          return GroupService.invite(device)
        })
        .then(function(device) {
          console.log(device)
          console.log("enter1",device.display.url);
          $scope.device = device
          $scope.control = ControlService.create(device, device.channel)

          // TODO: Change title, flickers too much on Chrome
          // $rootScope.pageTitle = device.name
            // UserService.getTime().then(resp=>{
            //   if(resp.data.cumulativeTime <= 60) {
            //     $timeout(function() {
            //       $location.path('/')
            //     })
            //     return;
            //   }
              SettingsService.set('lastUsedDevice', serial)
              // })
              console.log(device)
            console.log("enter2",device.display.url);
          return device
        })
        .catch(function() {
          $timeout(function() {
            $location.path('/')
          })
        })
    }

    getDevice($routeParams.serial)

    $scope.$watch('device.state', function(newValue, oldValue) {
      console.log("valueLog")
      // console.log(newValue,oldValue)
      if(newValue == undefined && oldValue == undefined) {
       // $window.location.reload()
       console.log(newValue, oldValue)
        
      }
      if (newValue !== oldValue) {
/*************** fix bug: it seems automation state was forgotten ? *************/
        if (oldValue === 'using' || oldValue === 'automation') {
/******************************************************************************/
          FatalMessageService.open($scope.device, false)
        }
      }
    }, true)

  }
