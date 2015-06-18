/**
 * Mongoose data model for a Victim
 * @author Bram de Leeuw
 *    
 * hostName       : String    The hostname of the device making probe requests
 * macAddress     : String    The mac address of hte device making probe requests
 * firstSeen      : Date      The timestamp from the time this mac addr probed for an ssid 
 * lastSeen       : Date      The most current time this mac addt probed for an ssid
 * probeRequests  : Array     Array of objectId's from probeRequests
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ProbeRequest = require('./probeRequest').schema;

var VictimSchema = new Schema({
  hostName: String,
  macAddress: { type: String, lowercase: true },
  firstSeen: Date,
  lastSeen: Date,
  probeRequests: [ProbeRequest]
});

module.exports = mongoose.model('Victim', VictimSchema);