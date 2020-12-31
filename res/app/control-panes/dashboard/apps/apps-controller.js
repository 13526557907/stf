// See https://github.com/android/platform_packages_apps_settings/blob/master/AndroidManifest.xml



module.exports = function ShellCtrl($scope,$filter,gettext) {
  $scope.result = null

  var run = function(cmd) {
    var command = cmd
    // Force run activity
    command += ' --activity-clear-top'
    return $scope.control.shell(command)
      .then(function(result) {
        // console.log(result)
      })
  }

  // TODO: Move this to server side
  // TODO: Android 2.x doesn't support openSetting(), account for that on the UI

  function openSetting(activity) {
    run('am start -a android.intent.action.MAIN -n com.android.settings/.Settings\\$' +
    activity)
  }

  $scope.openSettings = function() {
    run('am start -a android.intent.action.MAIN -n com.android.settings/.Settings')
  }

  $scope.openWiFiSettings = function() {
    openSetting('WifiSettingsActivity')
    run('am start -a android.settings.WIFI_SETTINGS')
  }
  $scope.clickPower = function() {
    console.log("返回。。");

    run("input keyevent BACK")
  }

  $scope.openStore = function() {
    console.log("this is abb store")
    run("monkey -p com.huawei.appmarket -c android.intent.category.LAUNCHER 1")
    console.log(run("umpsys activity | findstr 'mResume'"))
  }


  $scope.camera = function() {
    run('am start -a android.media.action.STILL_IMAGE_CAMERA')
  }

  $scope.openLocaleSettings = function() {
    openSetting('LocalePickerActivity')
  }

  $scope.openIMESettings = function() {
    openSetting('KeyboardLayoutPickerActivity')
  }

  $scope.reboot = function() {
    var config = {
      rebootEnabled: true
    }

    /* eslint no-console: 0 */
    if (config.rebootEnabled) {
      var line1 = $filter('translate')(gettext('Are you sure you want to reboot this device?'))
      var line2 = $filter('translate')(gettext('The device will be unavailable for a moment.'))
      if (confirm(line1 + '\n' + line2)) {
        $scope.control.reboot().then(function(result) {
          console.error(result)
        })
      }
    }
  }

  $scope.openDisplaySettings = function() {
    openSetting('DisplaySettingsActivity')
  }

  $scope.openDeviceInfo = function() {
    openSetting('DeviceInfoSettingsActivity')
  }

  $scope.openManageApps = function() {
    //openSetting('ManageApplicationsActivity')
    run('am start -a android.settings.APPLICATION_SETTINGS')
  }

  $scope.openRunningApps = function() {
    openSetting('RunningServicesActivity')
  }

  $scope.openDeveloperSettings = function() {
    openSetting('DevelopmentSettingsActivity')
  }

  $scope.clear = function() {
    $scope.command = ''
    $scope.data = ''
    $scope.result = null
  }
}
