/**
 * Mongoose data model for a SSID
 * @author Bram de Leeuw
 *
 * name       : String      The name of the SSID
 * macAddress : String      The mac address of the router
 * location   : Array       The sessions location, can be multiple locations if the ssid is not unique
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var LocationSchema = require('./location').schema;

var SSIDSchema = new Schema({
  name: String,
  macAddress: { type: String, lowercase: true },
  locations: [LocationSchema]
});

module.exports = mongoose.model('SSID', SSIDSchema);