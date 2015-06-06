/**
 * Mongoose data model for a ProbeRequest
 * @author Bram de Leeuw
 *
 * on   : Date        The date and time of the request
 * ssid : ObjectId    The probed ssid
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProbeRequestSchema = new Schema({
  date: Date,
  signal: Number,
  ofVolume: Number,
  ofHue: Number,
  ssid: { type: Schema.Types.ObjectId, ref: 'SSID' }
  //victim: { type: Schema.Types.ObjectId, ref: 'Victim' }
});

module.exports = mongoose.model('ProbeRequest', ProbeRequestSchema);