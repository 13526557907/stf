var jwtutil = require('../../../../../../../lib/util/jwtutil');

module.exports = function ServiceFactory($uibModal, $location) {
  var service = {}

  var ModalInstanceCtrl = function($scope, $uibModalInstance) {
    $scope.ok = function() {
      // $uibModalInstance.close(true);
      // console.log(`${jwtutil.baseUrl}/realMachine/index`);
      window.location.href=`${jwtutil.baseUrl}/realMachine/index`
    }

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel')
    }
  }

  service.open = function() {
    var modalInstance = $uibModal.open({
      backdrop: 'static',
      template: require('./vmodal-open.pug'),
      controller: ModalInstanceCtrl
    })
    modalInstance.result.then(function(/*selectedItem*/) {
    }, function() {
    })
  }

  return service
}
