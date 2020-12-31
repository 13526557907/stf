const { all } = require('bluebird')
var QueryParser = require('./util/query-parser')
var request = require('request');

module.exports = function DeviceListCtrl(
  $scope
  , DeviceService
  , DeviceColumnService
  , $http
  , $log
  , GroupService
  , ControlService
  , SettingsService
  , $location
  , UserService
) {
  $scope.tracker = DeviceService.trackAll($scope)
  $scope.control = ControlService.create($scope.tracker.devices, '*ALL')
  $scope.columnDefinitions = DeviceColumnService

  var defaultColumns = [
    // {
    //   name: 'state'
    // , selected: false
    // }
    {
      name: 'manufacturer'
      , selected: true
    }
    , {
      name: 'platform',
      selected: true
    }
    // , {
    //   name: 'platform',
    //  selected: true
    // }
    , {
      name: 'serial',
      selected: true
    }
    // , {
    //     name: 'serial'
    //   , selected: false
    //   }
    // , {
    //     name: 'operator'
    //   , selected: false
    //   }
    // , {
    //     name: 'releasedAt'
    //   , selected: false
    //   }
    // , {
    //     name: 'version'
    //   , selected: true
    //   }
    // , {
    //     name: 'network'
    //   , selected: false
    //   }
    , {
      name: 'display'
      , selected: true
    }
    // , {
    //     name: 'manufacturer'
    //   , selected: false
    //   }
    // , {
    //     name: 'sdk'
    //   , selected: false
    //   }
    // , {
    //     name: 'abi'
    //   , selected: false
    //   }
    // , {
    //     name: 'cpuPlatform'
    //   , selected: false
    //   }
    // , {
    //     name: 'openGLESVersion'
    //   , selected: false
    //   }
    // , {
    //     name: 'browser'
    //   , selected: false
    //   }
    // , {
    //     name: 'phone'
    //   , selected: false
    //   }
    // , {
    //     name: 'imei'
    //   , selected: false
    //   }
    // , {
    //     name: 'imsi'
    //   , selected: false
    //   }
    // , {
    //     name: 'iccid'
    //   , selected: false
    //   }
    // , {
    //     name: 'batteryHealth'
    //   , selected: false
    //   }
    // , {
    //     name: 'batterySource'
    //   , selected: false
    //   }
    // , {
    //     name: 'batteryStatus'
    //   , selected: false
    //   }
    // , {
    //     name: 'batteryLevel'
    //   , selected: false
    //   }
    // , {
    //     name: 'batteryTemp'
    //   , selected: false
    //   }
    // , {
    //     name: 'provider'
    //   , selected: true
    //   }
    // , {
    //     name: 'notes'
    //   , selected: false
    //   }
    // , {
    //     name: 'owner'
    //   , selected: true
    //   }, {
    //     name: 'phoneOrder'
    //   , selected: true
    //   }
  ]

  $scope.stateList = [
    { label: '全部', value: 'all' },
    { label: '空闲', value: 'available' },
    { label: '我的', value: 'own' },
  ]
  $scope.columns = defaultColumns

  SettingsService.bind($scope, {
    target: 'columns'
    , source: 'deviceListColumns'
  })
  var defaultSort = {
    fixed: [
      {
        name: 'state'
        , order: 'asc'
      }
    ]
    , user: [
      {
        name: 'name'
        , order: 'asc'
      }
    ]
  }

  function getStfAppoint() {
    return new Promise((res, rej) => {
      let data = {
        account: UserService.ecodeEmail,
      }
      let serialList = []
      UserService.getStfAppoint(data).then(resp => {
        console.log('dddddresp-------', resp)
        if (resp.data.status == 'SUCCESS') {
          if (resp.data.msg.pageItems.length) {
            serialList = resp.data.msg.pageItems.map(m => m.serial)
          }
          res(serialList)
        } else {
          rej(serialList)
        }
      })
    })
  }
  $scope.sort = defaultSort

  SettingsService.bind($scope, {
    target: 'sort'
    , source: 'deviceListSort'
  })

  $scope.filter = []
  $scope.phoneSearchIos = 2;
  $scope.phoneSearchAndroid = 1;
  $scope.activeTabs = {
    icons: true
    , details: false
  }

  SettingsService.bind($scope, {
    target: 'activeTabs'
    , source: 'deviceListActiveTabs'
  })
  $scope.ManufacturerShowLimit = 1;
  $scope.moreButtonValue = '更多'
  $scope.ManufacturerMax = 6
  $scope.moreButtonToggle = function () {
    console.log('$scope.moreButtonValue', $scope.moreButtonValue)
    if ($scope.moreButtonValue === '更多') {
      $scope.moreButtonValue = '收起'
      $scope.ManufacturerList = $scope.filterList.manufacturer.values

    } else if ($scope.moreButtonValue === '收起') {
      $scope.moreButtonValue = '更多'
      $scope.ManufacturerList = []
      for (let i = 0; i < $scope.ManufacturerMax; i++) {
        if (i < $scope.filterList.manufacturer.values.length) {
          $scope.ManufacturerList.push($scope.filterList.manufacturer.values[i])
        }
      }
    }
  }
  $scope.applyFilterInput = function (query) {
    let arr = [...$scope.DictMap.get(query)]
    let checkList = document.getElementsByClassName('checkInputs');
    for (let i = 0; i < checkList.length; i++) {
      checkList[i].checked = false
    }
    $scope.filter = []
    for (let i of arr) {
      var object = {
        field: 'manufacturer',
        op: null,
        query: i,
        brand: query
      }
      if (!$scope.filter.some(f => f.query === i)) {
        $scope.filter.push(object);
      }
    }
    console.log($scope.filter);
  }
  $scope.stateActive = 'all'
  $scope.stateButtonChange = function (value) {
    console.log('value', value)
    if (value !== $scope.stateActive) {
      $scope.stateActive = value;
      let isSet = $scope.filter.some(f => f.field === 'state')
      for (let i = 0; i < $scope.filter.length; i++) {
        if ($scope.filter[i].tag === 'state') {
          $scope.filter.splice(i, 1)
          break
        }
      }
      if (value === 'all') {

      } else if (value === 'own') {
        console.log('value=own', value)
        let data = {
          account: UserService.ecodeEmail,
        }
        UserService.getStfAppoint(data).then(resp => {
          console.log('dddddresp-------', resp)
          if (resp.data.status == 'SUCCESS') {
            if (resp.data.msg.pageItems.length) {
              for (const i of resp.data.msg.pageItems) {
                $scope.filter.push({
                  field: 'serial',
                  op: null,
                  query: i.serial,
                  tag: 'state'
                })
              }
            }

          } else {
          }
        })
        // getStfAppoint().then((list) => {
        //   console.log('list', list)
        //   if (list.length) {
        //     for (const i of list) {
        //       console.log(i)
        //       $scope.filter.push({
        //         field: 'serial',
        //         op: null,
        //         query: i,
        //         tag: 'state'
        //       })
        //     }
        //   }
        // })

      } else {
        if (isSet) {
          for (let i = 0; i < $scope.filter.length; i++) {
            if ($scope.filter[i].field === 'state') {
              $scope.filter[i].query = value
              break
            }
          }
        } else {
          $scope.filter.push({
            field: 'state',
            op: null,
            query: value,
            tag: 'state'
          })
        }
      }
    }
  }
  $scope.checkInput = function (brand, e, type, platform = '') {
    // brand = brand === '未知' ? undefined : brand;
    console.log('checkInput', brand, e, type)

    let id = `${platform ? platform : ''}${type}AllCheck`
    AllCheck = document.getElementById(id);
    if (e.toElement.checked == true) {
      let arr = [brand];

      if (type === 'manufacturer') {
        arr = [...$scope.DictMap.get(brand)]
      }
      for (let i of arr) {
        var object = {
          field: type,
          op: null,
          query: i,
          brand
        }
        if (!$scope.filter.some(f => f.query === i)) {
          $scope.filter.push(object);
        }
      }

      if (isAllChecked(`${platform ? platform : ''}${type}`)) {
        AllCheck.checked = true
      }
    } else {
      AllCheck.checked = false;
      let len = $scope.filter.length
      for (let i = len - 1; i >= 0; i--) {
        if (brand === $scope.filter[i].brand && type === $scope.filter[i].field) {
          $scope.filter.splice(i, 1)
          break
        }
      }
    }
  }
  function isAllChecked(type) {
    checkList = document.getElementsByClassName(type);
    for (let i = 0; i < checkList.length; i++) {
      if (checkList[i].checked === false) {
        return false;
      }
    }
    return true;
  }
  $scope.allCheck = function (e, type, platform = '') {
    checkList = document.getElementsByClassName(`${platform ? platform : ''}${type}`);
    for (let i = 0; i < checkList.length; i++) {
      checkList[i].checked = e.toElement.checked;
      $scope.checkInput(checkList[i].value, { toElement: checkList[i] }, type, platform)
    }

    // let len = $scope.filter.length - 1;
    // for (let i = len; i >= 0; i--) {
    //   if ($scope.filter[i].field === type) {
    //     $scope.filter.splice(i, 1)
    //   }
    // }
  }

  $scope.search = {
    deviceFilter: '',
    focusElement: false
  }
  $scope.system = ''
  $scope.chooseList = []
  $scope.focusSearch = function () {
    if (!$scope.basicMode) {
      $scope.search.focusElement = true
    }
  }

  $scope.reset = function () {
    $scope.search.deviceFilter = ''
    $scope.filter = []
    $scope.sort = defaultSort
    $scope.columns = defaultColumns
    let checkList = document.getElementsByClassName('checkInputs');
    for (let i = 0; i < checkList.length; i++) {
      checkList[i].checked = false
    }
  }





  function chooseListInit() {
    return $http.get('/api/v1/devices').then(function (response) {
      let devices = response.data.devices
      let versionList = { title: '版本', name: 'version_type', values: [] }
      let displayList = { title: '分辨率', name: 'display', values: { width: [], height: [], display: [] } }
      let manufacturerList = { title: '品牌', name: 'manufacturer', values: [] }
      let chooseList = {
        version: { Android: versionList, iOS: versionList }, display: displayList, manufacturer: manufacturerList
      }
      chooseList.version = JSON.parse(JSON.stringify(chooseList.version))
      chooseList.display = JSON.parse(JSON.stringify(chooseList.display))
      chooseList.manufacturer = JSON.parse(JSON.stringify(chooseList.manufacturer))
      for (let i = 0; i < devices.length; i++) {
        const device = devices[i]
        let obj = {
          version: device.version ? device.version.split(".")[0] : 0,
          display: {
            width: device.display ? device.display.width : 0,
            height: device.display ? device.display.height : 0,
            display: device.display ? `${device.display.width}x${device.display.height}` : '',
          },
          manufacturer: device.manufacturer || '未知'
        }
        let key
        if (device.platform === 'Android') {
          key = 'Android'
        } else if (device.platform === 'iOS') {
          key = 'iOS'
        }
        if (key) {
          for (let o in obj) {
            let val = obj[o];
            if (val) {
              if (typeof val === 'object') {
                for (let a in val) {
                  if (!chooseList[o].values[a].some(v => v === val[a])) {
                    chooseList[o].values[a].push(val[a])
                  }
                }
              } else if (typeof val === 'string') {
                if (o === 'version') {
                  if (!chooseList[o][key].values.some(v => v === val)) {
                    chooseList[o][key].values.push(val)
                  }
                } else if (o === 'manufacturer') {
                  let manVal = $scope.DictNameObject[val] || '未知'
                  if (!chooseList[o].values.some(v => v === manVal)) {
                    chooseList[o].values.push(manVal)
                  }
                } else {
                  if (!chooseList[o].values.some(v => v === val)) {
                    chooseList[o].values.push(val)
                  }
                }
              }
            }
          }
        }

      }
      for (let i in chooseList.version) {
        chooseList.version[i].values = chooseList.version[i].values.sort((a, b) => a - b)
      }

      $scope.filterList = chooseList
      $scope.ManufacturerList = []
      for (let i = 0; i < $scope.ManufacturerMax; i++) {
        if (i < $scope.filterList.manufacturer.values.length) {
          $scope.ManufacturerList.push($scope.filterList.manufacturer.values[i])
        }
      }
      console.log('chooseList', chooseList)
    })
  }
  // $scope.systemChange = function (s) {
  //   checkList = document.getElementsByClassName('platform');
  //   for (let i = 0; i < checkList.length; i++) {
  //     checkList[i].checked = checkList[i].value === s;

  //   }
  //   if (['Android', 'iOS'].indexOf(s) > -1) {
  //     if ($scope.system !== s) {
  //       $scope.reset()
  //       $scope.system = s
  //       $scope.filterList = $scope.chooseList[s];
  //       $scope.filter.push({
  //         field: 'platform',
  //         op: null,
  //         query: s
  //       })
  //     }
  //   }
  // }
  //`${jwtutil.baseUrl}/stf/getDictItem`
  $scope.DictMap = []
  $scope.DictNameArr = [];
  $scope.DictNameObject = {}
  request.post({ url: `http://192.168.0.57:8081/stf/getDictItem`, form: {} }, function (error, response, body) {
    if (!error) {
      let map = new Map();
      let obj = {}
      body = JSON.parse(body);
      if (body.length) {
        for (const i of body) {
          obj[i.code] = i.name;
          if (map.has(i.name)) {
            // let val = map.get(i.name);
            // val.add(i.code)
            map.set(i.name, map.get(i.name).add(i.code))
          } else {
            map.set(i.name, new Set([i.code]))
          }
        }
        map.set('未知', new Set())
        $scope.DictMap = map;
        $scope.DictNameArr = map.keys()
        $scope.DictNameObject = obj
        chooseListInit();
      }
    }
  })
}
