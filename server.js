var Scratch = require('scratch-api');
var express = require('express');
var path = require('path');
var app = express();

app.use(express.static('public'));

var USERNAME = process.env.SCRATCH_USER;
var PASSWORD = process.env.SCRATCH_PASSWORD;
var PROJECT_ID = 109772772;
var cloud;

var running = false;

app.post("/run", function(req, res){
  setServerStatus(!running);
  res.send("" + running);
});

app.get("/status", function(req, res){
  res.send("" + running);
});

if (process.env.C9_PROJECT) {
  app.listen(process.env.PORT, process.env.IP, function() {
    console.log('listening');
  });
} else {
  app.set('port', (process.env.PORT || 5000));
  app.listen(app.get('port'), function() {
    console.log('listening');
  });
}

function initCloud() {
  Scratch.UserSession.create(USERNAME, PASSWORD, function(e, user) {
    if(e) {
      running = false;
      return console.error(e);
    }
    console.log("Logged in");
    user.cloudSession(PROJECT_ID, function(e, cloud_) {
      if(e) {
        running = false;
        return console.error(e);
      }
      console.log("Connected to cloud");
      cloud = cloud_;
      server();
    });
  });
}

function encode(data) {
  var encoded = "0xFF" + data.map(function(item) {
    return ("" + item).split('').map(function(e) {
      var hex = e.charCodeAt().toString(16);
      while (hex.length < 2) hex = "0" + hex;
      return hex;
    }).join('');
  }).join('FF');
  return encoded;
}

function decode(data) {
  if (typeof data != "string") return null;
  data = data.substring(4);
  return data.split(/FF/i).map(function(item) {
    return item.match(/.{2}/g).map(function(letter) {
      return String.fromCharCode(parseInt(letter, 16));
    }).join('');
  });
}

function setServerStatus(flag) {
  console.log("Server running: " + flag);
  if (flag) {
    running = true;
    initCloud();
  }
  else {
    running = false;
    if (cloud) cloud.end();
  }
}

var x = 0,
  y = 0,
  dir = 0;

function server() {
  if (!running) {
    return;
  }
  try {
    var p1 = decode(cloud.get("\u2601 cloud1"));
    if (p1 != null) {
      var p1x = parseFloat(p1[2]);
      var p1y = parseFloat(p1[3]);
      dir += (Math.atan2(p1y - y, p1x - x) - dir) / 20;

      x += (p1x - x) / 20;
      y += (p1y - y) / 20;
    }
    cloud.set('\u2601 cloud3', encode(["BOT follower", Math.random(), x, y, 90 - (dir * 180 / Math.PI)]));
  }
  catch (e) {
    running = false;
    console.error(e);
    return;
  }

  setTimeout(server, 1000 / 30);
}