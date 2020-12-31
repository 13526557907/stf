var _ = require('lodash')
var request = require('request');
var jwtutil = require('../../../../lib/util/jwtutil');
module.exports = function DeviceControlCtrl($scope, DeviceService, GroupService,UserService,
  $location, $timeout, $window, $rootScope, $http, phoneTimeoutService) {

  $scope.showScreen = true
  $scope.hour = "66"
  var hour = 0;
  var minutes = 0;
  var seconds = 0;
  $scope.timeRemb = 0;
  $scope.groupTracker = DeviceService.trackGroup($scope)
  $scope.groupDevices = $scope.groupTracker.devices;
  var hrefArr = $window.location.href.split('/');
  var deviceFor = hrefArr[hrefArr.length-1];
  var timer = setInterval(function(){      
         seconds ++;
         if(seconds == 60){
          // 
          UserService.getTime().then(resp=>{
            if(resp.data.cumulativeTime <= 0) {
                $location.path('/')
            }
            })
            request.post({url:`${jwtutil.baseUrl}/stf/findPhoneBySerial`, form:{serial: deviceFor}},function(error, response, body) {
              var respBody = JSON.parse(body);
              console.log(respBody);
              console.log(respBody.appoint , UserService.publicEmail , UserService.publicEmail)
              if(respBody.appoint == 1 && UserService.publicEmail != respBody.stfAppoint.account ) {
                    phoneTimeoutService.open();
                    $location.path('/')
                // console.log(respBody.stfAppoint.endtime.replace('-','/').replace('-','/'));
                // console.log(jwtutil.transTime(new Date()));
                // $scope.timeRemb = respBody.stfAppoint.endtime.replace('-','/').replace('-','/');
              }
            })
            // if($scope.timeRemb - jwtutil.transTime(new Date()) <=0 && $scope.timeRemb !=0) {
            // }

            seconds = 0;
            minutes ++;
            };
            if(document.getElementById('minutes')!==null) {
              document.getElementById('minutes').innerHTML = minutes;
              document.getElementById('seconds').innerHTML = seconds;
            } else {
              clearInterval(timer);
            }
        },1000);
  $scope.kickDevice = function(device) {
    if (!device || !$scope.device) {
      alert('No device found')
      return
    }

    try {
      // If we're trying to kick current device
      if (device.serial === $scope.device.serial) {
        // If there is more than one device left
        if ($scope.groupDevices.length > 1) {

          // Control first free device first
          var firstFreeDevice = _.find($scope.groupDevices, function(dev) {
            return dev.serial !== $scope.device.serial
          })
          $scope.controlDevice(firstFreeDevice)

          // Then kick the old device
          GroupService.kick(device).then(function() {
            $scope.$digest()
          })
        } else {
          // Kick the device
          GroupService.kick(device).then(function() {
            $scope.$digest()
          })
          $location.path('/devices/')
        }
      } else {
        console.log("enter 888236")
        GroupService.kick(device).then(function() {
          $scope.$digest()
        })
      }
    } catch (e) {
      alert(e.message)
    }
  }

  $scope.controlDevice = function(device) {
    $location.path('/control/' + device.serial)
  }
  function showNum(num) {
    if (num < 10) {
     return '0' + num
    }
    return num
   }

  function isPortrait(val) {
    var value = val
    if (typeof value === 'undefined' && $scope.device) {
      value = $scope.device.display.rotation
    }
    return (value === 0 || value === 180)
  }

  function isLandscape(val) {
    var value = val
    if (typeof value === 'undefined' && $scope.device) {
      value = $scope.device.display.rotation
    }
    return (value === 90 || value === 270)
  }

  $scope.tryToRotate = function(rotation) {
    if (rotation === 'portrait') {
      $scope.control.rotate(0)
      $timeout(function() {
        if (isLandscape()) {
          $scope.currentRotation = 'landscape'
        }
      }, 400)
    } else if (rotation === 'landscape') {
      $scope.control.rotate(90)
      $timeout(function() {
        if (isPortrait()) {
          $scope.currentRotation = 'portrait'
        }
      }, 400)
    }
  }

  $scope.currentRotation = 'portrait'

  $scope.$watch('device.display.rotation', function(newValue) {
    if (isPortrait(newValue)) {
      $scope.currentRotation = 'portrait'
    } else if (isLandscape(newValue)) {
      $scope.currentRotation = 'landscape'
    }
  })

  // TODO: Refactor this inside control and server-side
  $scope.rotateLeft = function() {
    var angle = 0
    if ($scope.device && $scope.device.display) {
      angle = $scope.device.display.rotation
    }
    if (angle === 0) {
      angle = 270
    } else {
      angle -= 90
    }
    $scope.control.rotate(angle)

    if ($rootScope.standalone) {
      $window.resizeTo($window.outerHeight, $window.outerWidth)
    }
  }

  $scope.rotateRight = function() {
    var angle = 0
    if ($scope.device && $scope.device.display) {
      angle = $scope.device.display.rotation
    }
    if (angle === 270) {
      angle = 0
    } else {
      angle += 90
    }
    $scope.control.rotate(angle)

    if ($rootScope.standalone) {
      $window.resizeTo($window.outerHeight, $window.outerWidth)
    }
  }
  $scope.quality = '60'
  $scope.rate = $scope.quality
  $scope.test = function() {
    console.log('调整画质为：' + $scope.quality)
    $scope.rate = $scope.quality
  }
    $scope.$on("$destroy", function() {
      GroupService.kick($scope.device).then(function() {
        $scope.$digest()
      })
  })

}
