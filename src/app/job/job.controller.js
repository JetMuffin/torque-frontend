(function() {
  'use strict';

  angular
    .module('sherFrontend')
    .controller('JobController', JobController)
    .config(['$validationProvider', function ($validationProvider) {
        $validationProvider.showSuccessMessage = false;
        $validationProvider.showErrorMessage = true; 
    }]);

  /** @ngInject */
   function JobController($scope, $stateParams, $interval, $uibModal, $state, toastr, jobManager) {
      $scope.query = $stateParams.query || "all";

      // 加载数据
      var reload = function (query) {
          jobManager.refresh().$promise.then(function(response) {
              $scope.jobs = jobManager.getJobs(query)
              $scope.jobCount = jobManager.getAllJobs().length;
          });
      }

      // 初次加载数据
      reload($scope.query);

      // 搜索任务
      $scope.search = function () {
          $state.go('navbar.job', {query: $scope.search_key})
      }

      // 表格行点击
      $scope.rowClick = function(jobID){
        $state.go('navbar.jobdetail',{jobID: jobID});
      };

      // 打开提交任务的模态框
      $scope.openJobModal = function () {
          var modalInstance = $uibModal.open({
              animation: true,
              templateUrl: 'app/job/job.modal.html',
              controller: JobModalCtrl,
              size: 'md',
              windowTemplateUrl: 'app/components/modal/modal.window.html',
              resolve: {

              }
          });
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

  // 模块对话框控制器
  var JobModalCtrl = function ($scope, $rootScope, $uibModalInstance, toastr, jobManager, $injector) {
      var $validationProvider = $injector.get('$validation');
      $scope.job = {};
      
      $scope.addTask = function() {
          $scope.job.tasks.push({})
      }

      $scope.deleteTask = function() {
          $scope.job.tasks.pop();
      }

      $scope.addPort = function(taskIndex) {
          $scope.job.tasks[taskIndex].port_mappings.push({
          })
      }

      $scope.deletePort = function(taskIndex, portIndex) {
        $scope.job.tasks[taskIndex].port_mappings.pop();
      }

      $scope.submit = function (form) {
        // $validationProvider.validate(form);
        jobManager.submitJob($scope.code, function(response){
          console.log(response)
          if(response.httpCode == 200) {
            toastr.success('Create job successful!');
          } else {
            toastr.error(response.content, 'Create job failed!');
          }
        }, function(response) {
          console.log(response);
            toastr.error(response.content, 'Create job failed!');
        });
        $uibModalInstance.close();
      };

      $scope.cancel = function () {
          $uibModalInstance.dismiss('cancel');
      };

      $scope.open = function(type) {
          $rootScope.openNavigator([]);
          $scope.type = type;
      }

      $scope.checkValid = $validationProvider.checkValid;

      var watcher = $scope.$watch('job', function() {
          $scope.code = jobManager.getJobScript($scope.job);
      }, true)

      $scope.readScripts = function (file) {
          $scope.code = file.content;
      };

      // 离开页面时释放监听
      $scope.$on("$destroy", function(event) {
        watcher();
      })            
    };


})();
