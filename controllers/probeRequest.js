/**
 *  Probe Request Controller
 *  @author Bram de Leeuw
 */

var ProbeRequest = require('../models/probeRequest');
var ssidController = require('./SSID');


/**
 *  Create a new probe request
 *  @author Bram de Leeuw
 *  @param    Object  options
 *  @callback Callback
 */
exports.create = function(options, callback) {
  var ssid, macAddress, signal, volume, hue;
  ssid = options.ssid;
  macAddress = options.macAddress;
  signal = options.signal;
  volume = options.volume;
  hue = options.hue;

  console.log('new probeRequest for ssid:', ssid);

  var probeRequest = new ProbeRequest();
  probeRequest.date = new Date();
  probeRequest.signal = signal;
  probeRequest.ofVolume = volume;
  probeRequest.ofHue = hue;
  
  ssidController.newSSID({ 
    name: ssid, 
    macAddress: macAddress 
  }, function(ssidID) {
    probeRequest.ssid = ssidID._id;
    probeRequest.save(function(err, savedProbeRequest) {
      if (err)
        return err;

      callback(savedProbeRequest);
    });
  });
}