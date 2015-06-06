/**
 *  Location Controller
 *  @author Bram de Leeuw
 */

var Location = require('../models/location');
var StreetViewImage = require('../models/streetViewImage');


/**
 *  Create a new location
 *  @param    String  name
 *  @param    Number  longitude 
 *  @param    Number  latitude
 *  @callback returnLocation
 */
exports.newLocation = function(name, macAddress, longitude, latitude, returnLocation) {
  var fileName = name.replace(' ','-');
  console.log('create location with name:', fileName, 'lat,lon', latitude,longitude);

  var location = new Location();
  location.name = fileName;
  location.macAddress = macAddress;
  location.location = [longitude, latitude];

  getStreetViewImages(longitude, latitude, fileName, function(streetViewImages) {
    
    streetViewImages.forEach(function(streetViewImage) {
      location.streetView.push(streetViewImage);
    });
    
    returnLocation(location);
  });
}


/**
 *  Find streetview images for a given coordinate
 *  TODO: Download the images and save the path in the object (when requests are high)
 *  @param    Number  longitude 
 *  @param    Number  latitude
 *  @param    String  name
 *  @callback returnImages
 */
function getStreetViewImages(longitude, latitude, name, returnImages) {
  var base = "https://maps.googleapis.com/maps/api/streetview"
  var streetViewImages = [];
  var p = {};
  p.size = "?size=640x425";
  p.location = "&location="+latitude+","+longitude;
  p.fov = "&fov=120";
  p.heading = "&heading=";

  for (i=0; i < 36; i++) {
    var degree = i * 10;
    var streetViewURL = base + p.size + p.location + p.fov + p.heading + degree;

    var streetViewImage = new StreetViewImage();
    streetViewImage.originalURL = streetViewURL;
    streetViewImage.name = name +"-"+ degree +".jpg";
    streetViewImage.heading = degree;
    streetViewImage.size = [640, 425];
    streetViewImage.path = "/path/to/" + streetViewImage.name;
    streetViewImages.push(streetViewImage);
  }
  
  returnImages(streetViewImages);
}