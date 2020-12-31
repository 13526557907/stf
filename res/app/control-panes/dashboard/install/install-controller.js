module.exports = function InstallCtrl(
  $scope
  , InstallService
) {
  $scope.accordionOpen = true
  $scope.installation = null

  $scope.clear = function () {
    $scope.installation = null
    $scope.accordionOpen = false
  }

  $scope.$on('installation', function (e, installation) {
    $scope.installation = installation.apply($scope)
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
