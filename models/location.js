/**
 * Mongoose data model for a Location
 * @author Bram de Leeuw
 *
 * name       : String              The name of the location
 * location   : [Number]            The longitude and latitude
 * streetView : [StreetViewImage]   An array consisting of 36 streetview images
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var StreetViewImage = require('./streetViewImage').schema;

var LocationSchema = new Schema({
  name: String,
  macAddress: { type: String, lowercase: true },
  location: {type: [Number], index: '2d'},
  streetView: [StreetViewImage]
});

module.exports = mongoose.model('Location', LocationSchema);