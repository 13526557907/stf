module.exports = function UploadCtrl(
  $scope
  , InstallService
) {
  $scope.accordionOpen = true
  $scope.installationFile = null

  $scope.clear = function () {
    $scope.installationFile = null
    $scope.accordionOpen = false
  }

  $scope.$on('saveFiles', function (e, installation) {
    $scope.installationFile = installation.apply($scope)
  })

  $scope.installUrl = function (url) {
    console.log('installUrl', url)
    return InstallService.installUrl($scope.control, url)
  }

  $scope.installFile = function ($files) {
    var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
    if (reg.test($files[0].name)) {
      alert("文件名不能包含中文或者空格！！")
      return;
    }
    console.log("enter files test")
    console.log($files);
    if ($files.length) {
      $scope.showChinaErr = false;
      return InstallService.installFile($scope.control, $files)
    }
  }
  $scope.filesReady = []
  $scope.fileName = '暂未选择文件'
  $scope.saveFileReady = function ($files) {
    var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
    if (reg.test($files[0].name)) {
      alert("文件名不能包含中文或者空格！！")
      return;
    }
    $scope.fileName = $files[0].name
    $scope.filesReady = $files;
  }
  $scope.saveFile = function () {
    if ($scope.filesReady.length) {
      $scope.showChinaErr = false;
      return InstallService.saveFile($scope.control, $scope.filesReady)
    }
  }

  $scope.uninstall = function (packageName) {
    // TODO: After clicking uninstall accordion opens
    return $scope.control.uninstall(packageName)
      .then(function () {
        $scope.$apply(function () {
          $scope.clear()
        })
      })
  }
}
