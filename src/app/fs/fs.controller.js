(function() {
  'use strict';

  angular
    .module('sherFrontend')
    .controller('FileSystemController', FileSystemController)
    .config(['fileManagerConfigProvider', config]);

  /** @ngInject */
  function config(config, sherConfig) {
    config.set({
      searchForm: true,
      optionButton: true,
      breadcrumb: true,
      showSizeForDirectories: true,
      viewTable: true,
      allowedActions: {
        upload: true,
        rename: true,
        move: true,
        copy: true,
        edit: true,
        changePermissions: false,
        compress: false,
        compressChooseName: false,
        extract: false,
        download: true,
        downloadMultiple: true,
        preview: true,
          remove: true
      },         
    })
  }

  /** @ngInject */
  function FileSystemController($scope, fileNavigator, sherConfig){
    $scope.options = {
      breadcrumb: true,
      optionButton: true,
      showSizeForDirectories: true,
      viewTable: true,
      allowedActions: {
          upload: true,
          rename: true,
          move: true,
          copy: true,
          edit: true,
          changePermissions: false,
          compress: false,
          compressChooseName: false,
          extract: false,
          download: true,
          downloadMultiple: true,
          preview: true,
          remove: true
      },      
    }
  }

})();
