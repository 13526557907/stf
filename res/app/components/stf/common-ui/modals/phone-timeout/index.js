module.exports = angular.module('stf.phone-timeout-service', [
  require('stf/common-ui/modals/common').name,
  require('ui-bootstrap').name
])
  .factory('phoneTimeoutService', require('./phone-timeout-service'))
