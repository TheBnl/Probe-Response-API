/**
 *  SSID Controller
 *  @author Bram de Leeuw
 */

var wigle = require('wigle');
var SSID = require('../models/SSID');
var locationController = require('./location');
var wigleUser = process.env.WIGLEUSERNAME;
var wiglePass = process.env.WIGLEPASSWORD;


/**
 *  Login to the Wigle.net service
 *  @param   Object err
 *  @param   Object results
 */
wigle.login(wigleUser, wiglePass, function (err, results) {
  if(err)
    console.log(err);
  
  console.log('WIGLE:',results);
});


/**
 *  Find or Create a new SSID
 *  @param    String  name
 *  @param    String  macAddress
 *  @callback retrunSSID
 */
exports.newSSID = function(options, callback) {
  var name, macAddress, dontUseWigle;
  name = options.name;
  macAddress = options.macAddress;
  dontUseWigle = options.dontUseWigle ? options.dontUseWigle : true;
  
  SSID.findOne({ name: name }, function(err, foundData) {
    if (err)
        throw err;

    if (foundData) {
      callback(foundData);
    }

    else if (dontUseWigle && name != undefined) {
      var ssid = new SSID();
      ssid.name = name;
      ssid.macAddress = macAddress;
      ssid.save(function(err, saveData) {
        if (err)
          throw err;

        console.log(name, 'saved!');
        callback(saveData);
      });
    }

    else if (name != undefined) {
      getLocation(name, function(locations) {
        var ssid = new SSID();
        ssid.name = name;
        ssid.macAddress = macAddress;
        ssid.locations = locations;
        ssid.save(function(err, saveData) {
          if (err)
            throw err;

          callback(saveData);
        });
      });
    }
  });
}


/**
 *  Get locations connected to the ssid name or mac addres (when found)
 *  on the Wigle.net service
 *  TODO: move to location controller voor obvious resons ?
 *  TODO: find a way to decreace the number of wigle.net api calls
 *  TODO: find a location by device mac address when available
 *  TODO: Bepalen hoe een keuze te maken uit waslijst aan ssids
 *  TODO: Bepalen hoe om te gaan met een lege lijst
 *  @param    String  name
 *  @callback returnLocations
 */
function getLocation(name, returnLocations) {
  var locations = [];

  /** 
   * Keep the search box in the netherlands lat 50.7500 – 53.5000 lon 2.5000 – 7.2000
   */
  wigle.search({
    latrange1: '50.7500', // min
    latrange2: '53.5000', // max
    longrange1: '2.5000', // min
    longrange2: '7.2000', // max
    ssid: name,
    //netid: // mac adress if available 
    page: 1
  }, function (err, results) {
    if(err)
      console.log(err);

    //var results = results.resultCount == 0 ? false : true;

    if (results.success) {

      //console.log('GOT RESULTS!:',results);
      console.log('GOT RESULTS!:', 
        results.results[0].trilong, 
        results.results[0].trilat, 
        results.results[0].netid, 
        results.results[0].ssid
      );

      // return the first 5 results
      var count = results.resultCount < 5 ? results.resultCount : 5;
      console.log('GOING TO PUHS', count, 'LOCATIONS');

      for (i=0; i<count; i++) {
        var fileName = name +"-"+ i;
        var result = results.results[i];
        locationController.newLocation(fileName, result.netid, result.trilong, result.trilat, function(location) {
          locations.push(location);
        });
      }

      // TODO: hele locatie object aan locatieController doorgeven en returnLocations in callback plaatsen
      returnLocations(locations);
    }

    else {
      console.log('NOTHING FOUND!:',results);
      returnLocations(locations);
    }
    
  });
}


/**
 *  Get all SSIDs from the database
 *  @param   Object request
 *  @param   Object response
 *  @return  Object
 */
exports.getSSIDs = function(req, res) {
  SSID.find(function(err, ssids) {
    if (err)
      res.send(err);

    res.json(ssids);
  });
};


/**
 *  Get a SSID from the database
 *  @param   Object request
 *  @param   Object response
 *  @return  Object
 */
exports.getSSID = function(req, res) {
  SSID.findById(req.params.mac, function(err, ssid) {
    if (err)
      res.send(err);

    res.json(ssid);
  });
};


/**
 *  Delete a SSID from the database
 *  @param   Object request
 *  @param   Object response
 *  @return  Object
 */
exports.deleteSSID = function(req, res) {
  SSID.findByIdAndRemove(req.params.mac, function(err) {
    if (err)
      res.send(err);

    console.log('deleting SSID with id:', req.params.mac);
    res.json({ message: 'SSID removed from the server' });
  });
};