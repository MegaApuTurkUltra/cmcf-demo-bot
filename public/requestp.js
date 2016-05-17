//requestp.js - A simple promise based wrapper around XMLHttpRequest

function requestp (options) {
  'use strict';
  return new Promise(function (resolve, reject) {
    var req = new XMLHttpRequest();
    if (options.headers) {
      for (var key in options.headers){
        req.setRequestHeader(key, options.headers[key]);
      }
    }
    if (options.mimetype) {
      req.overrideMimeType(options.mimetype);
    }
    if (options.user) {
      req.open(options.method, options.url, true, options.user, options.password);
    }
    else {
      req.open(options.method, options.url, true);
    }
    req.onload = function() {
      if (req.status == 200) {
        resolve(req.response);
      }
      else {
        reject(Error(req.statusText));
      }
    };
    req.onerror = function(eStr, eUrl, eLn, eCol, eObj) {
      reject(eObj);
    };
    if (options.body) {
      req.send(options.body);
    }
    else {
      req.send();
    }
  });
};

requestp.get = function(url, params, opts){
    opts = opts || {};
    params = params || [];
    opts.method = "get";
    opts.url = url;
    var params2 = [];
    for(var key in params){
        params2.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
    }
    if(params2.length) opts.url += "?" + params2.join("&");
    return requestp(opts);
};
requestp.post = function(url, body, opts){
    opts = opts || {};
    body = body || "";
    opts.method = "post";
    opts.url = url;
    if(typeof body == "string") opts.body = body;
    else {
        var params = body;
        var params2 = [];
        for(var key in params){
            params2.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
        }
        if(params2.length) opts.body = params2.join("&");
    }
    return requestp(opts);
};

window.requestp = requestp;