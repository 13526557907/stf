var request = require('request');
var jwtutil = require('../../../../lib/util/jwtutil');
module.exports = function ScreenshotsCtrl($scope,$http) {
  $scope.screenshots = []
  $scope.screenShotSize = 400

  $scope.clear = function() {
    $scope.screenshots = []
  }

  $scope.shotSizeParameter = function(maxSize, multiplier) {
    var finalSize = $scope.screenShotSize * multiplier
    var finalMaxSize = maxSize * multiplier

    return (finalSize === finalMaxSize) ? '' :
    '?crop=' + finalSize + 'x'
  }
  function getImageFileFromUrl(url, imageName,callback) {
    // imageName一定要带上后缀
      var blob = null;
      var xhr = new XMLHttpRequest(); 
      xhr.open("GET", url);
      xhr.setRequestHeader('Accept', 'image/jpeg');
      xhr.responseType = "blob";
      xhr.onload = () => {
    if (xhr.status == 200) {
        blob = xhr.response;
        let imgFile = new File([blob], imageName, {type: 'image/jpeg'});
      console.log(imgFile)
        callback.call(this,imgFile);
      }};
      xhr.send();
  }

  $scope.takeScreenShot = function() {
    $scope.control.screenshot().then(function(result) {
      $scope.$apply(function() {
        console.log("test image")
        console.log(result.body.href);
        getImageFileFromUrl(result.body.href,result.body.name,function(file){
          console.log(938748)
          console.log(file)
          var params = new FormData();
          params.append("file" , file)
          params.append("pictureName" , result.body.name)
          params.append("debugId" , 133)
          $http.post(jwtutil.baseUrl+'/stf/savePicture', params, {
          headers: {
            "Content-Type": function () {
              return undefined;
            }
          },
          transformRequest: angular.identity // 可选,防止发生意外的数据转换，这样写可以保证数据类型不变
        }).then(function (data) {
        
        
        })
        });
        $scope.screenshots.unshift(result)
      })
    })
  }

  $scope.zoom = function(param) {
    var newValue = parseInt($scope.screenShotSize, 10) + param.step
    if (param.min && newValue < param.min) {
      newValue = param.min
    } else if (param.max && newValue > param.max) {
      newValue = param.max
    }
    $scope.screenShotSize = newValue
  }
}
