require('./phone-cancel.css')
module.exports = angular.module('stf.phone-cancel-service', [
  require('stf/common-ui/modals/common').name,
  require('ui-bootstrap').name
])
  .factory('phoneCancelnService', require('./phone-cancel-service'))
