/**
* Copyright © 2019 contains code contributed by Orange SA, authors: Denis Barbaron - Licensed under the Apache license 2.0
**/
// var baseUrl = "http://fairytest.com"
const baseUrl = "http://192.168.0.57:8081";
module.exports = function UserServiceFactory(
  $rootScope
  , $http
  , socket
  , AppState
  , AddAdbKeyModalService
) {
  var UserService = {}
  UserService.getCaption = function (obj, state) {
    var index = obj.lastIndexOf("\@");
    if (state == 0) {
      obj = obj.substring(0, index);
    } else {
      obj = obj.substring(index + 1, obj.length);
    }
    return obj;
  }
  var user = UserService.currentUser = AppState.user
  var email = UserService.getCaption(UserService.currentUser.email, 0)
  UserService.publicuser = UserService.currentUser = AppState.user;
  UserService.publicEmail = email;
  var ecodeEmail = encode64(email);
  UserService.ecodeEmail = ecodeEmail;
  UserService.getUser = function () {
    return $http.get('/api/v1/user')
  }
  UserService.getTime = function () {
    return $http.get(`${baseUrl}/stf/leftTimeByRealMacha?username=${ecodeEmail}`)
  }

  UserService.getOrderTime = function (data) {
    return $http.post(`${baseUrl}/stf/stfAppoint`, data)
  }
  UserService.getStfAppoint = function (data) {
    return $http.post(`${baseUrl}/stf/getStfAppoint`, data)
  }

  UserService.appointBack = function (data) {
    return $http.post(`${baseUrl}/stf/appointBack`, data)
  }

  UserService.getAdbKeys = function () {
    return (user.adbKeys || (user.adbKeys = []))
  }

  UserService.addAdbKey = function (key) {
    socket.emit('user.keys.adb.add', key)
  }

  function encode64(input) {
    var keyStr = "ABCDEFGHIJKLMNOP" + "QRSTUVWXYZabcdef" + "ghijklmnopqrstuv"
      + "wxyz0123456789+/" + "=";
    var output = "";
    var chr1, chr2, chr3 = "";
    var enc1, enc2, enc3, enc4 = "";
    var i = 0;
    do {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);
      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;
      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
      output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2)
        + keyStr.charAt(enc3) + keyStr.charAt(enc4);
      chr1 = chr2 = chr3 = "";
      enc1 = enc2 = enc3 = enc4 = "";
    } while (i < input.length);

    return output;
  }

  UserService.acceptAdbKey = function (key) {
    socket.emit('user.keys.adb.accept', key)
  }

  UserService.removeAdbKey = function (key) {
    socket.emit('user.keys.adb.remove', key)
  }

  socket.on('user.keys.adb.error', function (error) {
    $rootScope.$broadcast('user.keys.adb.error', error)
  })

  socket.on('user.keys.adb.added', function (key) {
    UserService.getAdbKeys().push(key)
    $rootScope.$broadcast('user.keys.adb.updated', user.adbKeys)
    $rootScope.$apply()
  })

  socket.on('user.keys.adb.removed', function (key) {
    user.adbKeys = UserService.getAdbKeys().filter(function (someKey) {
      return someKey.fingerprint !== key.fingerprint
    })
    $rootScope.$broadcast('user.keys.adb.updated', user.adbKeys)
    $rootScope.$apply()
  })

  socket.on('user.keys.adb.confirm', function (data) {
    AddAdbKeyModalService.open(data).then(function (result) {
      if (result) {
        UserService.acceptAdbKey(data)
      }
    })
  })

  return UserService
}
