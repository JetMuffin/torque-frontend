  (function() {
  'use strict';

  angular
    .module('sherFrontend')
    .factory('jobManager', jobManager);

  /** @ngInject */
  function jobManager($log, $resource, $http, sherConfig) {
    var api = sherConfig.API;

    var jobs = [];
    var healthyCount = 0;
    var unhealthCount = 0;
    var resource = $resource(api + '/job/list', {}, {
        query: {
            method: 'get',
            timeout: 20000
        },
    })

    function getJobs (callback) {
      return resource.query({

      }, function(r) {
        return callback && callback(r);
      })
    };

    function checkFormat(job) {
        for(var i = 0; i < job.tasks.length; i++) {
            job.tasks[i].scale = parseInt(job.tasks[i].scale);
            job.tasks[i].cpus = parseFloat(job.tasks[i].cpus);
            job.tasks[i].mem = parseFloat(job.tasks[i].mem);
            job.tasks[i].disk = parseFloat(job.tasks[i].disk);
            job.tasks[i].port_mappings.forEach(function(port) {
              port.host_port = parseInt(port.host_port);
              port.container_port = parseInt(port.container_port);
            })
        }
        return job;
    }

    function handleJobs(jobs) {
        jobs.sort(function(a, b) {
            return b.ctime - a.ctime;
        })

        var state_map = {
          R: {
            title: 'Running',
            color: 'info',
          },
          Q: {
            title: 'Queued',
            color: 'primary',
          },
          E: {
            title: 'Exiting',
            color: 'default',
          },
          H: {
            title: 'Held',
            color: 'warning',
          },
          B: {
            title: 'Blocked',
            color: 'danger',
          },
          C: {
            title: 'Complete',
            color: 'success'
          }
        }

        for(var i = 0; i < jobs.length; i++) {
          jobs[i].status = state_map[jobs[i].state].title;
          jobs[i].status_color = state_map[jobs[i].state].color;
          jobs[i].create_time = getDateSeconds(jobs[i].ctime);
          jobs[i].est_walltime = getSeconds(jobs[i].resourceList["resource_list.walltime"]);
          jobs[i].act_walltime = getSeconds(jobs[i].resourcesUsed["resource_list.walltime"]);
          jobs[i].walltime_remaining = remainPercent(jobs[i]);
        }

        return jobs
    } 

    function emptyArray(size) {
        var data = new Array();
        for(var i = 0; i < size; i++) {
            data.push(0);
        }
        return data;
    }

    function getSeconds(str) {
      if(!str) {
        return 0;
      }
      var splits = str.split(':');
      var hour = parseInt(splits[0]);
      var minute = parseInt(splits[1]);
      var second = parseInt(splits[2]);
      return hour*3600+minute*60+second;
    }

    function getDateSeconds(str) {
      var date = new Date(str);
      return date.getTime();
    }

    function remainPercent(job) {
      if(job.totalRuntime == 0 && job.walltimeRemaining == 0) {
        return 100;
      }
      if(job.totalRuntime == 0) {
        return 0;
      }
      return job.walltimeRemaining/(job.totalRuntime)*100;
    }

    return {
      // 刷新任务
      refresh: function() {
        return getJobs(function(response) {
          jobs = handleJobs(response.content);
        })
      },

      // 重置数据
      resetData: function() {
        jobs = [];
      },

      // 获取全部的任务
      getAllJobs: function() {
        return jobs;
      },

      // 搜索任务
      getJobs: function(key) {
        if(key == 'all') {
          return jobs;
        } else {
          var result = [];
          var pattern = new RegExp(key,'ig');
          for (var i = 0; i < jobs.length; i++) {
            if(JSON.stringify(jobs[i]).match(pattern)) {
              result.push(jobs[i]);
            }
          }
          return result;
        }
      },

      // 按状态过滤任务
      getJobsByStatus: function(status) {
        if(status == 'all') {
          return jobs;
        } else {
          var result = [];
          for (var i = 0; i < jobs.length; i++) {
            if (jobs[i].status.toLowerCase() == status.toLowerCase()) {
              result.push(jobs[i]);
            }
          }
          return result;
        }
      },   

      // 按任务健康状态过滤任务
      getJobsByHealth: function(health) {
        if(health == 'all') {
            return jobs;
          } else {
            var result = [];
            for (var i = 0; i < jobs.length; i++) {
              if (jobs[i].health.toLowerCase() == health.toLowerCase()) {
                result.push(jobs[i]);
              }
            }
            return result;
          }
      },

      // 按ID获取任务
      getById: function(id) {
        if (!!jobs) {
          for (var i = 0; i < jobs.length; i++) {
            if (jobs[i].id === id) {
              return jobs[i];
            }
          }
        } else {
          return null;
        }
      },

      // 提交任务
      submitJob: function(code, callback, errorHandle) {
        $.post(api + '/job/add', {
          content : code,
        }).success(function(response) {
          return callback && callback(response);
        }).error(function(response) {
          return errorHandle && errorHandle(response);
        });
      },

      // 删除任务
      deleteJob: function(id, callback, errorHandle) {
        $http({
          method: 'DELETE',
          url: api + '/jobs/' + id
        }).success(function(response) {
            return callback && callback(response);
        }).error(function(response) {
            return errorHandle && errorHandle(response);
        });
      },

      getJobScript: function(job) {
        var prefix = "#PBS";
        var options_map = {
          date_time: "-a",
          error_path: "-e",
          output_path: "-o",
          resource: "-l",
          name: "-N",
          priority: "-p",
          queue: "-q",
          merge_output_error: "-j",
        }

        var getOption = function(name, option) {
          if(!option || option == "") {
            return "";
          } 

          return prefix + " " + options_map[name] + " " + option + '\n';
        }

        var getResource = function(resource_name, resource, option_name, option) {
          if(!resource || resource == "") {
            return "";
          } 

          var line = "";
          line += prefix + " " + options_map['resource'] + " " + resource_name + "=" + resource;
          if(option) {
            line += ':' + option_name + "=" + option;
          }
          line += '\n';
          return line;
        }

        var scripts = "";
        scripts += getOption('name', job.name);
        scripts += getOption('error_path', job.error_path);
        scripts += getOption('output_path', job.output_path);
        scripts += getOption('date_time', job.date_time);
        scripts += getOption('queue', job.queue);
        scripts += getResource('nodes', job.nodes, 'ppn', job.ppn);
        scripts += getResource('walltime', job.walltime);
        if(job.merge_output_error)
          scripts += getOption('merge_output_error', 'oe');
        scripts += '\n';
        if(job.cmd)
          scripts += job.cmd;

        return scripts;
      },

      parseJobScripts: function() {

      },

      getOutput: function(jobID, callback) {
          $http({
              method: 'GET',
              url: api + '/job/output?jobID=' + jobID
          }).success(function(response) {
              return callback && callback(response);
          })
      },
      getError: function(jobID, callback) {
          $http({
              method: 'GET',
              url: api + '/job/error?jobID=' + jobID
          }).success(function(response) {
              return callback && callback(response);
          })
      },      
     
    }
  }
})();
