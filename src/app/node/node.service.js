(function() {
  'use strict';

  angular
    .module('sherFrontend')
    .factory('nodeManager', nodeManager);

  /** @ngInject */
  function nodeManager($resource, $http, sherConfig) {
      var API = sherConfig.API;
      var nodes = [];
      var resource = $resource(API + '/node/list', {}, {
          query: {
              method: 'get',
              timeout: 20000
          },
      })

      var getNodes = function(callback) {
          return resource.query({

          }, function(r) {
              return callback && callback(r);
          })
      };

      return {
          // 刷新任务
          refresh: function() {
              return getNodes(function(response) {
                  nodes = handleNodes(response.content);
              })
          },

          // 重置数据
          resetData: function() {
              nodes = [];
          },

          // 获取全部的Master
          getAllNodes: function() {
              return nodes;
          },

          filterNodes: function(state) {
              if(state == 'all') {
                  return nodes;
              }
              var result = [];
              for(var i = 0; i < nodes.length; i++) {
                  if(nodes[i].state.toLowerCase() == state.toLowerCase()) {
                      result.push(nodes[i]);
                  }
              }
              return result;
          },

          // 按ID获取任务
          getById: function(id) {
              if (nodes.length) {
                  for (var i = 0; i < nodes.length; i++) {
                      if (nodes[i].id === id) {
                          return nodes[i];
                      }
                  }
              }  
              return null;
          },

          clusterUsage: function(cluster_name, graph, callback) {
            $http({
              method: 'GET',
              url: sherConfig.ganglia_api + '?r=hour&m=load_one&json=1&c=' + cluster_name + '&g=' + graph
            }).success(function(response) {
                return callback && callback(response);
            }).error(function(response) {
                return errorHandle && errorHandle(response);
            });
          }
      }
  }

  function handleNodes(nodes) {
      var oneMegabyte = 1024 * 1024;
      var oneGigabyte = 1024 * oneMegabyte;   
      var HEARTBEAT_INTERVAL = 10;
          
      var result = []
      for(var i = 0; i < nodes.length; i++) {
          nodes[i].avail_mem = getMemroy(nodes[i].status.availmem);
          nodes[i].tot_mem = getMemroy(nodes[i].status.totmem);
          result.push(nodes[i]);
      }

      result.sort(function(a, b) {
          return b.name < a.name;
      });

      return result;
  }

  function getMemroy(str) {
    return parseInt(str.substring(0, str.length-2)); 
  }
  function getUsageColor(used, total) {
      var percent = used / total;
      if(percent < 0.5) {
          return ["green", "#eeeeee"];
      } else if (percent < 0.8 ){
          return ["orange", "#eeeeee"];
      } else {
          return ["red", "#eeeeee"];
      }
  }
})();
