(function() {
  'use strict';

  angular
    .module('sherFrontend')
    .controller('JobDetailController', JobDetailController)
    .controller('JobDetailFileController', JobDetailFileController)
    .controller('JobDetailErrorController', JobDetailErrorController)
    .controller('JobDetailOutputController', JobDetailOutputController);    

  /** @ngInject */
  function JobDetailController($scope, $http, $stateParams, jobManager, $uibModal, $state, $interval, toastr){
      // 加载数据
      var reload = function (query) {
        jobManager.refresh().$promise.then(function(response) {
          $scope.job = jobManager.getById($stateParams.jobID);
          $scope.refresh_random = Math.random();
        });
      }   

      reload();

      $scope.rowClick = function(taskID) {
      $state.go('navbar.taskdetail',{taskID: taskID});
      }

      // 加载任务, 定时监控
      var timer = $interval(function() {
          reload($scope.query);
      }, 1000);

      // 离开页面时删除计时器
      $scope.$on("$destroy", function(event) {
          $interval.cancel(timer);
      })      
  }

  function JobDetailFileController($scope, $stateParams, jobManager) {
    var reload = function (query) {
      jobManager.refresh().$promise.then(function(response) {
        $scope.job = jobManager.getById($stateParams.jobID);
        $scope.currentPath = $scope.job.work_directory.split("/");
        $scope.currentPath.shift();
        $scope.$broadcast("setCurrentPath", $scope.currentPath) 
      });
    }   

    reload();    
        
    $scope.$on("handshake", function() {
      reload();    
    })

    $scope.options = {
      breadcrumb: true,
      optionButton: false,
      showSizeForDirectories: true,
      viewTable: true,
      allowedActions: {
          upload: true,
          rename: false,
          move: false,
          copy: false,
          edit: false,
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

  /** @ngInject */
  function JobDetailErrorController($scope, $stateParams, jobManager) {
      var reload = function (query) {
          jobManager.getError($stateParams.jobID, function(response){
              console.log(response.content);
              $scope.logs = response.content.split('\n');
              console.log($scope.logs);
          });
      }   
      reload();
  }


  /** @ngInject */
  function JobDetailOutputController ($scope, $stateParams, jobManager) {
      var reload = function (query) {
          jobManager.getOutput($stateParams.jobID, function(response){
              $scope.logs = response.content.split('\n');
          });
      } 

      reload();
  }  
})();
