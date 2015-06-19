/**
 *  Search Controller
 *  @author Bram de Leeuw
 */

var Victim = require('../models/victim');
var SSID = require('../models/SSID');
var ProbeRequest = require('../models/probeRequest');


/**
 *  Get the results for the given search query
 *  @author Bram de Leeuw
 *  @param    Object  options
 *  @callback Callback
 */
exports.getResults = function(query, callback) {
  var findBy = query.findby;
  var searchFor = query.searchfor;
  var query = {};
  var date = new Date();
  var today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  var tomorrow = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

  switch(findBy) {
    case "mac":
      query = {'macAddress': new RegExp(searchFor, "i"), 'lastSeen': {"$gte": today, "$lt": tomorrow }};
      break;
    case "ssid":
      query = {'name': new RegExp(searchFor, "i")};
      break;
    default:
    case "host":
      query = {'hostName': new RegExp(searchFor, "i"), 'lastSeen': {"$gte": today, "$lt": tomorrow }};
      break;
  }

  if (findBy === "ssid") {
    SSID.find(query)
    .exec(function(err, ssid) {
      if (err)
        res.send(err);
      
      foudSSIDS = [];
      for(i=0; i < ssid.length; i++) {
        foudSSIDS.push(ssid[i]._id);
      }

      Victim.find({ 
        'probeRequests.ssid': {$in: foudSSIDS}, 
        'lastSeen': {"$gte": today, "$lt": tomorrow }
      })
      .populate('probeRequests.ssid')
      .exec(function(err, victims){
        callback(victims);
      });
    });
  } else {
    Victim.find(query)
    .populate('probeRequests.ssid')
    .exec(function(err, victims) {
      if (err)
        res.send(err);

      //console.log('SEARCHED FOR', victims);
      callback(victims);
    });
  }
}