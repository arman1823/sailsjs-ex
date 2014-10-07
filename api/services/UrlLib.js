var urls = require('../../config/urls');
var h = require('../../lib/helpers');
var _ = require('lodash');

var urllib = {};

urllib.__init__ = function(key) {

  var routes = {};

  var path;
  var tmpStack;
  for ( var i in urls ) {
    if ( i !== 'generic' ) {
      path = urls[i].path || (i == "index" ? "/" : "/" + i);
      if ( i == key ) {
        return path.replace(/^(get|post)\s*/i, '');
      }
      tmpStack = {
        controller: urls[i].controller || (h.uc(urls[i].path ? urls[i].path.split("/")[1] : 'Index') + "Controller"),
        action: urls[i].action || (urls[i].path ? (urls[i].path.split("/")[2] || urls[i].path.split("/")[1]) : 'index')
      };
      if ( path.match(/^(get|post)\s*/i) ) {
        routes[path] = _.clone(tmpStack);
      } else {
        routes['get ' + path] = _.clone(tmpStack);
        tmpStack.action += 'Post';
        routes['post ' + path] = _.clone(tmpStack);
      }
    }
  }

  var route;
  var tmp, tmpStack;
  for ( var i in urls.generic ) {
    route = urls.generic[i];
    tmp = route.split('.');
    if ( tmp.length > 1 ) {
      path = '/' + tmp[0] + '/' + tmp[1];
      tmpStack = {
        controller: h.uc(tmp[0]) + 'Controller',
        action: tmp[1]
      };
    } else {
      path = '/' + tmp[0];
      tmpStack = {
        controller: h.uc(tmp[0]) + 'Controller',
        action: 'index'
      };
    }
    routes['get ' + path] = _.clone(tmpStack);
    tmpStack.action += 'Post';
    routes['post ' + path] = _.clone(tmpStack);
    if ( key == route ) {
      return path.replace(/^(get|post)\s*/i, '');
    }
  }

  return key ? '' : routes;

};

module.exports = urllib.__init__;