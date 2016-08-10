(function() {
  'use strict';

  angular
    .module('sherFrontend')
    .controller('DashboardHealthController', DashboardHealthController)
    .controller('DashboardJobController', DashboardJobController)
    .controller('DashboardTaskController', DashboardTaskController);

  /** @ngInject */
  function DashboardHealthController($scope, $interval, nodeManager) {
    var totalPoints = 60;

    var reload = function() {
      nodeManager.clusterUsage('my cluster', 'cpu_report', function(response) {
        $scope.cpu.data = [];
        for(var i = 0; i < response[0].datapoints.length - 2; i++) {
          if(isNaN(response[0].datapoints[i][0])) {
            $scope.cpu.data.push(0);
          } else {
            $scope.cpu.data.push(response[0].datapoints[i][0]);
          }
        }
      });

      nodeManager.clusterUsage('my cluster', 'mem_report', function(response) {
        $scope.mem.data = [];
        for(var i = 0; i < response[0].datapoints.length - 2; i++) {
          if(isNaN(response[0].datapoints[i][0])) {
            $scope.mem.data.push(0);
          } else {
            $scope.mem.data.push(response[0].datapoints[i][0]/1024/1024);
          }
        }
      })      
      
      nodeManager.clusterUsage('my cluster', 'load_report', function(response) {
        $scope.load.data = [];
        for(var i = 0; i < response[3].datapoints.length - 2; i++) {
          if(isNaN(response[3].datapoints[i][0])) {
            $scope.load.data.push(0);
          } else {
            $scope.load.data.push(response[3].datapoints[i][0]);
          }
        }
      })        
    }

    $scope.cpu = {
      data: emptyArray(totalPoints),
      options: {
          max: 100,
          min: 0,
          stroke: "#9048d6",
          strokeWidth: 2,
          fill: "#3d365e",
          width: "100%",
          height: "140px",
      }
    };

    $scope.mem = {
      data: emptyArray(totalPoints),
        options: {
            max: 100,
            min: 0,
            stroke: "#8b54d7",
            strokeWidth: 2,
            fill: "#3d365e",
            width: "100%",
            height: "60px",
        }
    };
    $scope.load = {
      data: emptyArray(totalPoints),
        options: {
            max: 100,
            min: 0,
            stroke: "#8b54d7",
            strokeWidth: 2,
            fill: "#3d365e",
            width: "100%",
            height: "60px",
        }
    };       
    reload()

    // 加载任务, 定时监控
    var timer = $interval(function() {
        reload();
    }, 1000);

    // 离开页面时删除计时器
    $scope.$on("$destroy", function(event) {
        $interval.cancel(timer);
    })  
  }

  function DashboardJobController ($scope, $interval, $state, jobManager) {
      var reload = function () {
          jobManager.refresh().$promise.then(function(response) {
              $scope.jobs = {
                  total: jobManager.getJobsByStatus('all'),
                  running: jobManager.getJobsByStatus('Running'),
                  finished: jobManager.getJobsByStatus('Complete'),
                  failed: jobManager.getJobsByStatus('Blocked')
              }

              $scope.job = {
                  data: [$scope.jobs.running.length, $scope.jobs.finished.length, $scope.jobs.failed.length],
                  options: {
                      fill: ["#33c87e", "#8b8f9a", "#f94965"],
                      radius: 30,
                      innerRadius: 27,
                  }
              }        
          });
      }
      $scope.job = {
          data: [0, 0, 0],
          options: {
              fill: ["#33c87e", "#8b8f9a", "#f94965"],
              radius: 30,
              innerRadius: 27,
          }
      }       
      reload()

      // 加载任务, 定时监控
      var timer = $interval(function() {
          reload();
      }, 1000);

      // 离开页面时删除计时器
      $scope.$on("$destroy", function(event) {
          $interval.cancel(timer);
      })  
  }

  function DashboardTaskController ($scope, $interval, $state, jobManager) {
      $scope.tasks = {
          running: 0,
          waiting: 0,
      }
      var reload = function () {
          jobManager.refresh().$promise.then(function(response) {
              $scope.jobs = {
                  running: jobManager.getJobsByStatus('Running'),
                  waiting: jobManager.getJobsByStatus('Queued'),
              }
              $scope.overview.data[0] = $scope.jobs.running.length;
              $scope.overview.data[1] = $scope.jobs.waiting.length;                     
          });

      }    

      $scope.overview = {
          data: [0, 0],
          options: {
              fill: ["#fac543", "#33c87e"],
              radius: 75,
              innerRadius: 71,            
          }
      }
      
      reload();

      // 加载任务, 定时监控
      var timer = $interval(function() {
          reload();
      }, 1000);

      // 离开页面时删除计时器
      $scope.$on("$destroy", function(event) {
          $interval.cancel(timer);
      })      
  }

  function isZeroArray(array) {
    for(var i = 0; i < array.length; i++) {
      if(array[i] != 0) {
        return false;
      }
    }
    return true;
  }

  function emptyArray(size) {
    var data = [];
    while (data.length < size) {
        data.push(0);
    }
    return data;
  }

  function shiftAndPush(arr, used, free) {
    arr.shift();
    arr.push(used/(used+free)*100);
    return arr;
  }

})();
