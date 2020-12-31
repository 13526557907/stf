/**
* Copyright © 2019 code initially contributed by Orange SA, authors: Denis Barbaron - Licensed under the Apache license 2.0
**/

const _ = require('lodash')
var fs = require('fs');
var jwtutil = require('../../../lib/util/jwtutil')
module.exports = function GroupListCtrl(
  $scope
  , $filter
  , $http
  , $location
  , GroupsService
  , UserService
  , SettingsService
  , ItemsPerPageOptionsService
  , CommonService
) {
  const users = []
  const usersByEmail = {}
  const devices = []
  const devicesBySerial = {}
  const groupsById = {}
  const groupsEnv = {}
  const groupUserToAdd = {}
  const deviceFields =
    'serial,' +
    'version,' +
    'manufacturer,' +
    'marketName,' +
    'sdk,' +
    'display.width,' +
    'display.height,' +
    'model'

  function incrStateStats(group, incr) {
    if (group.isActive) {
      $scope.activeGroups += incr
    }
    else if (group.state === 'pending') {
      $scope.pendingGroups += incr
    }
    $scope.readyGroups = $scope.groups.length - $scope.activeGroups - $scope.pendingGroups
  }

  function updateStateStats(oldGroup, newGroup) {
    if (oldGroup === null) {
      incrStateStats(newGroup, 1)
    }
    else if (newGroup === null) {
      incrStateStats(oldGroup, -1)
    }
    else {
      if (newGroup.isActive && !oldGroup.isActive) {
        incrStateStats(newGroup, 1)
      }
      else if (!newGroup.isActive && oldGroup.isActive) {
        incrStateStats(oldGroup, -1)
      }
      else if (newGroup.state === 'ready' && oldGroup.state === 'pending') {
        incrStateStats(oldGroup, -1)
      }
    }
  }

  function updateGroupExtraProperties(group) {
    const status = { pending: 'Pending', waiting: 'Waiting', ready: 'Ready' }

    group.status = group.isActive ? 'Active' : status[group.state]
    group.startTime = $filter('date')(group.dates[0].start, SettingsService.get('dateFormat'))
    group.stopTime = $filter('date')(group.dates[0].stop, SettingsService.get('dateFormat'))

  }

  function updateQuotaBar(bar, consumed, allocated) {
    bar.value = (consumed / allocated) * 100 | 0
    if (bar.value < 25) {
      bar.type = 'success'
    }
    else if (bar.value < 50) {
      bar.type = 'info'
    }
    else if (bar.value < 75) {
      bar.type = 'warning'
    }
    else {
      bar.type = 'danger'
    }
  }

  function updateQuotaBars() {
    updateQuotaBar(
      $scope.numberBar
      , $scope.user.groups.quotas.consumed.number
      , $scope.user.groups.quotas.allocated.number
    )
    updateQuotaBar(
      $scope.durationBar
      , $scope.user.groups.quotas.consumed.duration
      , $scope.user.groups.quotas.allocated.duration
    )
  }

  function addGroup(group, timeStamp) {
    if (CommonService.add(
      $scope.groups
      , groupsById
      , group
      , 'id'
      , timeStamp)) {
      $scope.groupsEnv[group.id] = {
        devices: []
        , users: []
      }
      groupsEnv[group.id] = {
        devicesBySerial: {}
        , usersByEmail: {}
      }
      updateStateStats(null, group)
      updateGroupExtraProperties(group)
      return group
    }
    return null
  }

  function updateGroup(group, timeStamp) {
    return CommonService.update(
      $scope.groups
      , groupsById
      , group
      , 'id'
      , timeStamp)
  }

  function deleteGroup(id, timeStamp) {
    const group = CommonService.delete(
      $scope.groups
      , groupsById
      , id
      , timeStamp)

    if (group) {
      updateStateStats(group, null)
      delete $scope.groupsEnv[group.id]
      delete groupsEnv[group.id]
    }
    return group
  }

  function addUser(user, timeStamp) {
    if (CommonService.add(
      users
      , usersByEmail
      , user
      , 'email'
      , timeStamp
    ) && typeof groupUserToAdd[user.email] !== 'undefined') {
      addGroupUser(
        groupUserToAdd[user.email].id
        , user.email
        , groupUserToAdd[user.email].timeStamp)
      delete groupUserToAdd[user.email]
    }
  }

  function deleteUser(email, timeStamp) {
    return CommonService.delete(
      users
      , usersByEmail
      , email
      , timeStamp)
  }

  function addDevice(device, timeStamp) {
    return CommonService.add(
      devices
      , devicesBySerial
      , device
      , 'serial'
      , timeStamp)
  }

  function updateDevice(device, timeStamp) {
    return CommonService.update(
      devices
      , devicesBySerial
      , device
      , 'serial'
      , timeStamp)
  }

  function deleteDevice(serial, timeStamp) {
    return CommonService.delete(
      devices
      , devicesBySerial
      , serial
      , timeStamp)
  }

  function addGroupUser(id, email, timeStamp) {
    if (CommonService.isExisting(usersByEmail[email])) {
      CommonService.add(
        $scope.groupsEnv[id].users
        , groupsEnv[id].usersByEmail
        , users[usersByEmail[email].index]
        , 'email'
        , timeStamp)
    }
    else {
      groupUserToAdd[email] = { id: id, timeStamp: timeStamp }
    }
  }

  function deleteGroupUser(id, email, timeStamp) {
    CommonService.delete(
      $scope.groupsEnv[id].users
      , groupsEnv[id].usersByEmail
      , email
      , timeStamp)
  }

  function addGroupDevice(id, serial, timeStamp) {
    if (CommonService.isExisting(devicesBySerial[serial])) {
      CommonService.add(
        $scope.groupsEnv[id].devices
        , groupsEnv[id].devicesBySerial
        , devices[devicesBySerial[serial].index]
        , 'serial'
        , timeStamp)
    }
    else {
      GroupsService.getGroupDevice(id, serial, deviceFields)
        .then(function (response) {
          if (addDevice(response.data.device, timeStamp)) {
            CommonService.add(
              $scope.groupsEnv[id].devices
              , groupsEnv[id].devicesBySerial
              , devices[devicesBySerial[serial].index]
              , 'serial'
              , timeStamp)
          }
        })
    }
  }

  function deleteGroupDevice(id, serial, timeStamp) {
    CommonService.delete(
      $scope.groupsEnv[id].devices
      , groupsEnv[id].devicesBySerial
      , serial
      , timeStamp)
  }

  function updateGroupDevices(group, isAddedDevice, devices, timeStamp) {
    if (devices.length) {
      if (isAddedDevice) {
        devices.forEach(function (serial) {
          addGroupDevice(group.id, serial, timeStamp)
        })
      }
      else {
        devices.forEach(function (serial) {
          deleteGroupDevice(group.id, serial, timeStamp)
        })
      }
    }
  }

  function updateGroupUsers(group, isAddedUser, users, timeStamp) {
    if (users.length) {
      if (isAddedUser) {
        users.forEach(function (email) {
          addGroupUser(group.id, email, timeStamp)
        })
      }
      else {
        users.forEach(function (email) {
          deleteGroupUser(group.id, email, timeStamp)
        })
      }
    }
  }

  function initScope() {
    $scope.groupColumns = [
      { name: '序号', selected: true, sort: 'sort-asc' },
      { name: '使用设备', property: 'status'}
      ,
      { name: '型号', property: 'status'} 
      ,
      { name: '操作系统', property: 'status'}
      ,
      { name: '屏幕尺寸', property: 'status'}
      , { name: '分辨率', property: 'name' }
      , { name: '使用时长', property: 'status' }
      , { name: '开始时间', property: 'status' }
    ]
    $scope.defaultGroupData = {
      columns: [
        { name: '序号', selected: true, sort: 'sort-asc' },
        { name: '使用设备', selected: true, sort: 'sort-asc' }
        , { name: '型号', selected: true, sort: 'sort-asc' }
        , { name: '操作系统', selected: true, sort: 'sort-asc' },
        { name: '屏幕尺寸', selected: true, sort: 'sort-asc' }
        , { name: '分辨率', selected: true, sort: 'sort-asc' }
        , { name: '使用时长', selected: true, sort: 'sort-asc' }
        , { name: '开始时间', selected: true, property: 'sort-asc' }
      ]
      , sort: { index: 1, reverse: false }
    }
    GroupsService.getOboeGroups(function (group) {
      addGroup(group, -1)
    })
      .done(function () {
        $scope.$digest()
      })
      $http({
        method : "get",
        url :`${jwtutil.baseUrl}/stf/stfAccountTime?username=${UserService.ecodeEmail}&pageSize=10&currentPage=1`,
        data : '', // pass in data as strings
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' } // set the headers so angular passing info as form data (not request payload)
        })
        .success(function(data) {
          console
          console.log(data)
          data.pageItems.forEach(resp=>{
            resp.countPhone = Math.floor(resp.costTime / 60) + '分钟'
          })
         $scope.statistics = data.pageItems
       })
       .error(function(error) {
         console.log(error);
       });
       SettingsService.bind($scope, {
        target: 'groupData'
        , source: 'groupData'
        , defaultValue: $scope.defaultGroupData
      })
      $scope.groupData = JSON.parse(JSON.stringify($scope.defaultGroupData))
  }

  $scope.scopeGroupListCtrl = $scope
  $scope.sortBy = CommonService.sortBy
  $scope.getDuration = CommonService.getDuration
  $scope.getClassName = CommonService.getClassName
  $scope.user = UserService.currentUser
  $scope.numberBar = {}
  $scope.durationBar = {}
  $scope.groupsEnv = {}
  $scope.groups = []
  $scope.showTr = true;
  $scope.activeGroups = $scope.readyGroups = $scope.pendingGroups = 0
  $scope.itemsPerPageOptions = ItemsPerPageOptionsService
  SettingsService.bind($scope, {
    target: 'groupItemsPerPage'
    , source: 'groupViewItemsPerPage'
    , defaultValue: $scope.itemsPerPageOptions[2]
  })
 $scope.statistics = [];
 $scope.initScopeFunc = function() {
   $scope.showTr = true;
  initScope();
 }
 $scope.orderFunc = function() {
   $scope.showTr = false;
   $scope.groupColumns = [
    { name: '序号', selected: true, sort: 'sort-asc' },
    { name: '设备', property: 'status'},
    { name: '型号', property: 'status'},
    { name: '操作系统', property: 'status'},
    { name: '创建时间', property: 'status'}
    , { name: '类型', property: 'name' }
    , { name: '配额变化', property: 'status' }
    , { name: '操作', property: 'status' }
  ]
  $scope.defaultGroupData = {
    columns: [
      { name: '序号', selected: true, sort: 'sort-asc' },
      { name: '设备', selected: true, sort: 'sort-asc' }
      , { name: '型号', selected: true, sort: 'sort-asc' }
      , { name: '操作系统', selected: true, sort: 'sort-asc' },
      { name: '创建时间', selected: true, sort: 'sort-asc' }
      , { name: '类型', selected: true, sort: 'sort-asc' }
      , { name: '配额变化', selected: true, sort: 'sort-asc' }
      , { name: '操作', selected: true, sort: 'sort-asc' }
    ]
    , sort: { index: 1, reverse: false }
  }
  SettingsService.bind($scope, {
    target: 'groupData'
    , source: 'groupData'
    , defaultValue: $scope.defaultGroupData
  })
  $scope.groupData = JSON.parse(JSON.stringify($scope.defaultGroupData))
  $http({
    method : "POST",
    url :`${jwtutil.baseUrl}/stf/appointRecode`,
    data : {"account":UserService.publicEmail} // pass in data as strings
    })
    .success(function(data) {
     $scope.statistics = data.msg
   })
   .error(function(error) {
     console.log(error);
   });
}
  $scope.mailToGroupOwners = function (groups) {
    CommonService.copyToClipboard(_.uniq(groups.map(function (group) {
      return group.owner.email
    }))
      .join(SettingsService.get('emailSeparator')))
      .url('mailto:?body=*** Paste the email addresses from the clipboard! ***')
  }

  $scope.mailToGroupUsers = function (group, users) {
    // group unused actually..
    CommonService.copyToClipboard(users.map(function (user) {
      return user.email
    })
      .join(SettingsService.get('emailSeparator')))
      .url('mailto:?body=*** Paste the email addresses from the clipboard! ***')
  }

  $scope.getTooltip = function (objects) {
    var tooltip = ''

    objects.forEach(function (object) {
      tooltip += object + '\n'
    })
    return tooltip
  }

  $scope.resetData = function () {
    $scope.groupData = JSON.parse(JSON.stringify($scope.defaultGroupData))
  }
  $scope.visiteDetail = function(dataList) {
    console.log(dataList)
    $location.path('/debugLog').search({dataList: JSON.stringify(dataList)})
    // $state.go('debugLog', {tableList: dataList});
  }
  $scope.initGroupUsers = function (group) {
    if (typeof $scope.groupsEnv[group.id].userCurrentPage === 'undefined') {
      $scope.groupsEnv[group.id].userCurrentPage = 1
      $scope.groupsEnv[group.id].userItemsPerPage = $scope.itemsPerPageOptions[1]
    }
    group.users.forEach(function (email) {
      addGroupUser(group.id, email, -1)
    })
  }

  $scope.initGroupDevices = function (group) {
    if (typeof $scope.groupsEnv[group.id].deviceCurrentPage === 'undefined') {
      $scope.groupsEnv[group.id].deviceCurrentPage = 1
      $scope.groupsEnv[group.id].deviceItemsPerPage = $scope.itemsPerPageOptions[1]
    }
    GroupsService.getOboeGroupDevices(group.id, false, deviceFields, function (device) {
      addDevice(device, -1)
      addGroupDevice(group.id, device.serial, -1)
    })
      .done(function () {
        $scope.$digest()
      })
  }

  $scope.$on('user.view.groups.created', function (event, message) {
    addGroup(message.group, message.timeStamp)
  })

  $scope.$on('user.view.groups.deleted', function (event, message) {
    deleteGroup(message.group.id, message.timeStamp)
  })

  $scope.$on('user.view.groups.updated', function (event, message) {
    if (CommonService.isExisting(groupsById[message.group.id])) {
      if (message.group.users.indexOf(UserService.currentUser.email) < 0) {
        deleteGroup(message.group.id, message.timeStamp)
      }
      else {
        updateStateStats($scope.groups[groupsById[message.group.id].index], message.group)
        updateGroupDevices(message.group, message.isAddedDevice, message.devices, message.timeStamp)
        updateGroupUsers(message.group, message.isAddedUser, message.users, message.timeStamp)
        updateGroup(message.group, message.timeStamp)
        updateGroupExtraProperties($scope.groups[groupsById[message.group.id].index])
      }
    }
    else {
      addGroup(message.group, message.timeStamp)
    }
  })

  $scope.$on('user.settings.users.created', function (event, message) {
    addUser(message.user, message.timeStamp)
  })

  $scope.$on('user.settings.users.deleted', function (event, message) {
    deleteUser(message.user.email, message.timeStamp)
  })

  $scope.$on('user.view.users.updated', function (event, message) {
    if (message.user.email === $scope.user.email) {
      $scope.user = message.user
      updateQuotaBars()
    }
  })

  $scope.$on('user.settings.devices.created', function (event, message) {
    addDevice(message.device, message.timeStamp)
  })

  $scope.$on('user.settings.devices.deleted', function (event, message) {
    deleteDevice(message.device.serial, message.timeStamp)
  })

  $scope.$on('user.settings.devices.updated', function (event, message) {
    updateDevice(message.device, message.timeStamp)
  })

  initScope()
}
