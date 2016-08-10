(function() {
  'use strict';

  angular
    .module('sherFrontend')
    .provider('sherConfig', sherConfig);

  function sherConfig() {
    var values = {
      API: "http://121.42.203.75:8080/api",
      ganglia_api: "http://121.42.203.75/ganglia/graph.php",
      listened_host: "121.42.203.75",
    }

    return {
      $get: get,
      set: set
    }
    
    /** @ngInject */
    function get() {
      return values;
    }

    function set(constants) {
      angular.extend(values, constants);
    }
  }
})();
