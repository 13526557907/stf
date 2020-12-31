module.exports = angular.module('stf.vmodal-open-service', [
  require('stf/common-ui/modals/common').name,
  require('ui-bootstrap').name
])
  .factory('VmodalOpenService', require('./vmodal-open-service'))
