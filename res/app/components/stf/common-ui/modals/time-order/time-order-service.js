var jwtutil = require('../../../../../../../lib/util/jwtutil');
// const e = require('express');

module.exports = function ServiceFactory($uibModal, $location) {
  var service = {}

  var ModalInstanceCtrl = function($scope, $uibModalInstance,$timeout,UserService) {
    $scope.modelShow = false;
    $scope.message = "";
    $scope.okBtnMessage = "确定预约"
    $scope.goInvest = false;
    $scope.btnHide = false;
    $scope.device = service.device;
    $scope.timeMin = 0;
    $scope.timeObj = {
      startTime: new Date(),
      endTime: new Date(),
      startTimeSen:new Date(new Date().getTime() + 1000*60*30),
      endTimeSen: new Date(new Date().getTime() + 1000*60*30)
    }
    $scope.ok = function() {
      $scope.okBtnMessage = "预约中...";
      console.log(document.getElementsByClassName('loadingBtn')[0]);
      $scope.btnHide = true;
      if(jwtutil.transTimeYear($scope.timeObj.startTime) && jwtutil.transTimeYear($scope.timeObj.endTime && jwtutil.transTimeHour($scope.timeObj.startTimeSen) && jwtutil.transTimeHour($scope.timeObj.endTimeSen))) {
        let startTime = jwtutil.transTimeYear($scope.timeObj.startTime) + " " + jwtutil.transTimeHour($scope.timeObj.startTimeSen);
        let endTime = jwtutil.transTimeYear($scope.timeObj.endTime) + " " + jwtutil.transTimeHour($scope.timeObj.endTimeSen);
        // console.log(parseInt(new Date(endTime) - new Date(startTime)) / 1000 / 60);

        console.log(jwtutil.transTimeYear($scope.timeObj.startTime).replace(/\//g,"-"));
        const regData = new Date(jwtutil.transTimeYear($scope.timeObj.startTime).replace(/\//g,"-"))
        if(regData.getDay() == 0 || regData.getDay() == 6) {
          $scope.modelShow = true;
          $scope.message = "周六周日无法预约";
          return
        } 
        const workTime = "9:00"
        const endWorkTime = "17:50"
        const nowTime = new Date().getHours()+':'+new Date().getMinutes();
        console.log(startTime);
        console.log(new Date());
        console.log(  parseInt(new Date(startTime) - new Date()) / 1000 / 60 )
        console.log($scope.device.state);
        if( ($scope.device.state == "absent"  || $scope.device.state == "offline") && parseInt(new Date(startTime) - new Date()) / 1000 / 60 < 30) {
          $scope.modelShow = true;
          $scope.message = "未连接手机需要提前半小时预约！（开始时间大于当前时间半小时）";
          return;
        }
        if(!jwtutil.time_range (workTime, endWorkTime, nowTime)) {
          $scope.modelShow = true;
          $scope.message = "当前时间不在预约时间内（预约时间为工作日（9:00-17:50）";
          return;
        }
        if(parseInt(new Date(endTime) - new Date(startTime)) / 1000 / 60 > 0) {
          let data = {
            serial:$scope.device.serial,
            account: UserService.ecodeEmail,
            starttime: startTime.replace('/','-').replace('/','-'),
            endtime: endTime.replace('/','-').replace('/','-')
          }
          document.getElementsByClassName('loadingBtn')[0].disabled = true;
          // UserService.getOrderTime(data).then(resp=>{
          //   $scope.goInvest = false;
          //   if(resp.data.status == 'SUCCESS') {
          //     $scope.modelShow = true;
          //     $scope.message = JSON.parse(resp.data.msg).desc;
          //    // $scope.timeMin = JSON.parse(resp.data.msg).time;
          //     $timeout(function() {
          //       $uibModalInstance.dismiss('cancel')
          //       $location.path('/')
          //     }, 2000)
          //   } else {
          //     $scope.modelShow = true;
          //     document.getElementsByClassName('loadingBtn')[0].disabled = false;
          //     if(resp.data.msg == "时间不够") {
          //       $scope.goInvest = true;
          //     } else {
          //        $scope.message = resp.data.msg;
          //     }
          //   }
          // })
        } else {
          $scope.modelShow = true;
          $scope.message = "开始时间不能大于结束时间";
        }
      } else {
        $scope.modelShow = true;
        $scope.message = "无效时间"
      }
    }
    $scope.cancel = function() {
      $scope.modelShow = false;
      $scope.message = ""
      $uibModalInstance.dismiss('cancel')
    }
    $scope.today = function() {
      $scope.timeObj.startTime = new Date();
    };
    $scope.today();
  
    $scope.clear = function() {
      $scope.timeObj.startTime = null;
    };

    $scope.goInvestFunc = function() {
      window.location.href=`${jwtutil.baseUrl}/realMachine/index`
    }
  

    $scope.changed = function() {  
      if(jwtutil.transTimeYear($scope.timeObj.startTime) && jwtutil.transTimeYear($scope.timeObj.endTime && jwtutil.transTimeHour($scope.timeObj.startTimeSen) && jwtutil.transTimeHour($scope.timeObj.endTimeSen))) {
        let startTime = jwtutil.transTimeYear($scope.timeObj.startTime) + " " + jwtutil.transTimeHour($scope.timeObj.startTimeSen);
        let endTime = jwtutil.transTimeYear($scope.timeObj.endTime) + " " + jwtutil.transTimeHour($scope.timeObj.endTimeSen);
        if(parseInt(new Date(endTime) - new Date(startTime)) / 1000 / 60 > 0) {
          if(parseInt(new Date(endTime) - new Date(startTime)) / 1000 / 60 > 0){
            var timeCile = parseInt(new Date(endTime) - new Date(startTime)) / 1000 / 60
            $scope.timeMin = Math.ceil(timeCile / 60) * 2
          }
        }else {
          $scope.timeMin = 0;
        }
      }
    }
  
    $scope.toggleMin = function() {
      $scope.minDate = $scope.minDate ? null : new Date();
    };
    function getDayClass(data) {
      var date = data.date,
        mode = data.mode;
      if (mode === 'day') {
        var dayToCheck = new Date(date).setHours(0,0,0,0);
  
        for (var i = 0; i < $scope.events.length; i++) {
          var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);
  
          if (dayToCheck === currentDay) {
            return $scope.events[i].status;
          }
        }
      }
  
      return '';
    }
  
    // $scope.toggleMin();
    // $scope.maxDate = new Date(2020, 5, 22);
  
    $scope.open1 = function() {
      $scope.popup1.opened = true;
    };
  
    $scope.open2 = function() {
      $scope.popup2.opened = true;
    };
  
    $scope.setDate = function(year, month, day) {
      $scope.timeObj.startTime = new Date(year, month, day);
    };
  
    $scope.dateOptions = {
      formatYear: 'yy',
      showWeeks: false,
      startingDay: 1
      
    };
      // Disable weekend selection
    function disabled(data) {
    var date = data.date,
      mode = data.mode;
    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
  }
  
    $scope.formats = ['yyyy/MM/dd', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    $scope.altInputFormats = ['yyyy/MM/dd'];
  
    $scope.popup1 = {
      opened: false
    };
  
    $scope.popup2 = {
      opened: false
    };

    $scope.hstep = 1;
    $scope.mstep = 1;
  
    $scope.options = {
      hstep: [1, 2, 3],
      mstep: [1, 5, 10, 15, 25, 30]
    };
    $scope.ismeridian = false;
  
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var afterTomorrow = new Date();
    afterTomorrow.setDate(tomorrow.getDate() + 1);
    $scope.events =
      [
        {
          date: tomorrow,
          status: 'full'
        },
        {
          date: afterTomorrow,
          status: 'partially'
        }
      ];
  
    $scope.getDayClass = function(date, mode) {
      if (mode === 'day') {
        var dayToCheck = new Date(date).setHours(0,0,0,0);
  
        for (var i = 0; i < $scope.events.length; i++) {
          var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);
  
          if (dayToCheck === currentDay) {
            return $scope.events[i].status;
          }
        }
      }
  
      return '';
    };


  }
  service.open = function(device) {
    service.device = device;
    var modalInstance = $uibModal.open({
      template: require('./time-order.pug'),
      controller: ModalInstanceCtrl
    })
    modalInstance.result.then(function(/*selectedItem*/) {
    }, function() {
    })
  }

  return service
}
