var socket = io();

$(document).ready(function() {

  setUpStickyHeaders('header');

  socket.on('color', function (data) {
    var color = 'hsl('+ ofHueToCSSHue(data.color) +', 100%, 50%)';
    //document.body.style.backgroundColor = color;
    $('body').css('background-color', color);
    $('header').css('background-color', color);
  });
});

$(window).on('load', function() {
  $('#loading').hide();
  $('#victims').css({
    opacity: 1,
    overflow: 'scroll' 
  });
});

/**
 *  Loop trough all available headers and attach the stickyness to it
 */
function setUpStickyHeaders(elem) {
  var z = 1;
  $(elem).each(function() {
    //console.log($(this));
    $(this).css('z-index', z++);
    var sticky = new Waypoint.Sticky({
      element: $(this)[0]
    })
  });
}


/**
 *  converts the given open frameworks hue value to an css capable hue value
 *  @param float ofHue
 *  @return float coverted hue value
 */ 
function ofHueToCSSHue(ofHue) {
  var maxHue = 360;
  var minHue = 0;
  var maxIn = 255;
  var minIn = 0;
  return (((maxHue - minHue) / (maxIn - minIn)) * (ofHue - minIn)) + minHue;
}