var jwtutil = require('../../../../../../../lib/util/jwtutil');

module.exports = function ServiceFactory($uibModal, $location) {
  var service = {}

  var ModalInstanceCtrl = function($scope, $uibModalInstance,$timeout,UserService) {
    $scope.device = service.device
    $scope.modelShow = false;
    $scope.message = "";
    console.log($scope.device);
    $scope.ok = function() {
      let data = {
        appointId: $scope.device.stfAppoint.appointId
      }
      UserService.appointBack(data).then(resp => {
         if(resp.data.status == 'SUCCESS') {
              $scope.modelShow = true;
              $scope.message = resp.data.msg;
              $timeout(function() {
                $uibModalInstance.dismiss('cancel')
                $location.path('/')
              }, 2000)
            } else {
              $scope.modelShow = true;
              $scope.message = resp.data.msg;
            }
      })
    }

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel')
    }
  }

  service.open = function(device) {
    service.device = device;
    console.log(service.device);
    var modalInstance = $uibModal.open({
      backdrop: 'static',
      template: require('./phone-cancel.pug'),
      controller: ModalInstanceCtrl,
      windowClass:'modal-class',
    })
    modalInstance.result.then(function(/*selectedItem*/) {
    }, function() {
    })
  }

  return service
}
