/**
 * Mongoose data model for a SSID
 * @author Bram de Leeuw
 *
 * originalURL  : String    The original url to the streetview image
 * path         : String    The path to the local streetview image
 * name         : String    The name of the streetview iamge
 * heading      : String    The degree where the streetview image is rotated towards
 * size         : [Number]  The width and height of the image
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StreetViewImageSchema = new Schema({
  originalURL: String,
  path: String,
  name: String,
  heading: String,
  size: [Number] // [width,height]
});

module.exports = mongoose.model('StreetViewImage', StreetViewImageSchema);