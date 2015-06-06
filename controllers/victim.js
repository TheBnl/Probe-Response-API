/**
 *  Victim Controller
 *  @author Bram de Leeuw
 */
var Victim = require('../models/victim');
var probeRequestController = require('./probeRequest');
var moment = require('moment');
var io;

exports.setupSocket = function(socket) {
  io = socket;
}


/**
 *  Creates or updates a victem and stores it in the mongo database
 *  @param   Object request
 *  @param   Object response
 *  @return  Object
 */
exports.postVictim = function(req, res) {
  var hostName = req.body.hostName;
  var macAddress = req.body.macAddress;
  var ssidName = req.body.ssidName;
  var ssidMacAddress = req.body.ssidMacAddress;
  var ssidSignal = req.body.ssidSignal;
  var ssidVolume = req.body.ssidVolume;
  var ssidHue = req.body.ssidHue;

  Victim.findOne({ 
    macAddress: macAddress 
  }, function(err, foundVictim) {
    var victim, probeRequests;

    if (foundVictim) {
      victim = foundVictim;
      victim.macAddress = macAddress;
      if (hostName) victim.hostName = hostName;
      victim.lastSeen = new Date();
      probeRequests = victim.probeRequests;
    } 

    else {
      victim = new Victim();
      victim.hostName = hostName;  
      victim.macAddress = macAddress;  
      victim.firstSeen = new Date();   
      victim.lastSeen = new Date();
      probeRequests = [];
    }

    probeRequestController.create({
      ssid: ssidName, 
      macAddress: ssidMacAddress, 
      signal: ssidSignal, 
      volume: ssidVolume, 
      hue: ssidHue
    }, function(probeRequest) {
      probeRequests.push(probeRequest);
      victim.probeRequests = probeRequests;
      victim.save(function(err, victim) {
        if (err)
          return err;

        var updateOrCreate = victim.probeRequests.length == 1 ? true : false;
        emitVictim(victim, probeRequest, ssidName, updateOrCreate);
        res.json({ message: 'SUCCES: '+ victim.macAddress +' added to database' });
      });
    });
  });
};


/**
 *  Updates or creates a new victim after a user has connected.
 *  @param Object   victim
 *  @param Object   probeRequest 
 *  @param String   ssid
 *  @param Boolean  newVictim
 */
function emitVictim(victim, probeRequest, ssid, newVictim) {
  var diff = moment(victim.lastSeen).diff(moment(victim.firstSeen));
  var knownFor = 'Known for '+ moment.duration(diff).humanize() +' ';
  var on = moment(probeRequest.date).format("DD-MM-YY HH:MM:SS");
  var what = ssid ? ssid : 'Something';
  var line = 'On '+ on +' Searched for '+ what;

  var updateOrCreate = newVictim ? 'newVictim' : 'updateVictim';
  io.emit(updateOrCreate, {
    _id: victim._id,
    hostName: victim.hostName ? victim.hostName : 'Someone',
    knownFor: knownFor,
    probeRequest: line
  });
}


/**
 *  Get an list of all victims with known hostNames
 *  @param   Object request
 *  @param   Object response
 *  @return  Object
 */
exports.getVictimsWithHostNames = function(req, res) {
  Victim
    .find()
    .where('hostName').ne(null)
    .select('macAddress hostName')
    .exec(function(err, victims) {
      if (err)
        res.send(err);

      res.json(victims);
    });
};


/**
 *  Get an list of all victims in the database
 *  @param   Object request
 *  @param   Object response
 *  @return  Object
 */
exports.getVictims = function(req, res) {
  Victim
    .find()
    .populate('probeRequests.ssid')
    .exec(function(err, victims) {
      if (err)
        res.send(err);

      res.json(victims);
    });
};


exports.getVictimsAsData = function(macAddress, callback) {
  //var query = macAddress ? {macAddress: macAddress} : {};
  Victim
    .find()
    .populate('probeRequests.ssid')
    .exec(function(err, victims) {
      if (err)
        console.log(err);

      callback(victims);
    });
};


/**
 *  Get the information for one victim by his mac adress
 *  @param   Object request
 *  @param   Object response
 *  @return  Object
 */
exports.getVictim = function(req, res) {
  Victim
    .findOne({macAddress: req.params.mac})
    .populate({
      path: 'probeRequests.ssid',
      select: 'name -_id'
    })
    .exec(function(err, victims) {
      if (err)
        res.send(err);

      res.json(victims);
    });
};


/**
 *  Update an victims information
 *  TODO: bepalen of deze method uberhaupt nodig is.
 *  @param   Object request
 *  @param   Object response
 *  @return  Object
 */
exports.putVictim = function(req, res) {
  res.json({ message: 'Victim updated from the server (not working)' });
};


/**
 *  Delete a victim from the database
 *  @param   Object request
 *  @param   Object response
 *  @return  Object
 */
exports.deleteVictim = function(req, res) {
  Victim.findByIdAndRemove(req.params.mac, function(err) {
    if (err)
      res.send(err);

    console.log('deleting victim with id:', req.params.mac);
    res.json({ message: 'Victim removed from the server' });
  });
  
};