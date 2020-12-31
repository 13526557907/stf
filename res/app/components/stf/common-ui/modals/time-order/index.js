require('./time-order.css')
require('bootstrap/dist/css/bootstrap.css')
module.exports = angular.module('stf.time-order-service', [
  require('stf/common-ui/modals/common').name,
  require('ui-bootstrap').name
])
  .factory('timeOrderService', require('./time-order-service'))
