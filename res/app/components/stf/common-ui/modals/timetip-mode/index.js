module.exports = angular.module('stf.timetip-mode-service', [
  require('stf/common-ui/modals/common').name,
  require('ui-bootstrap').name
])
  .factory('timetipmodeService', require('./timetip-mode-service'))
