var socket = io();
var time = 0;
var timer = {
  start: function(){
    setInterval( function(){ 
      time++;
      //console.log(time);
    }, 10000);
  },
  currentTime: function() {
    return time;
  },
  restart: function() {
    time = 0;
  },
  stop: function() {
    clearInterval(this.start);
  }
}

$(document).ready(function() {

  timer.start();
  watchForUserInteraction();
  //setUpStickyHeaders('header');

  socket.on('color', function (data) {
    var color = 'hsl('+ ofHueToCSSHue(data.color) +', 100%, 50%)';
    $('body').css('background-color', color);
    $('html').css('background-color', color);
    $('#topBar').css('background-color', color);
    //$('header').css('background-color', color);
  });

  socket.on('newVictim', function (data) {
    appendNewVictim(data);
  });

  socket.on('updateVictim', function (data) {
    updateVictim(data);
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
    $(this).css('z-index', z++);
    var sticky = new Waypoint.Sticky({
      element: $(this)[0]
    })
  });
}


function watchForUserInteraction() {
  $('body').bind('touchmove', function(e) { 
    console.log($(this).scrollTop());
    timer.restart();
  });
}


/**
 *  Create an new victim and append it to the list of victims
 *  @param victim The victim data
 */
function appendNewVictim(victim) {
  var id = victim._id;
  var hostName = victim.hostName;
  var knownFor = victim.knownFor;
  var probeRequest = victim.probeRequest;
  var html =
    '<section class="waypoint" id="'+ id +'">' +
      '<header>' +
        '<h2>'+ hostName +'</h2>' +
        '<h3>'+ knownFor +'</h3>' +
      '</header>' +
      '<main>' +
        '<ul>';
          if (probeRequest != null) html + '<li>'+ probeRequest + '</li>';
 html + '</ul>' +
      '</main>' +
    '</section>';

  var element = $(html);
  element.appendTo('#victims').css('opacity', 0);

  if ( time > 5 ) {
    calculatePosition(element, function(position) {
      $('body').animate({
        scrollTop: position
      }, 300, function() {
        setTimeout(function() {
          element.css('opacity', 1);
        }, 100);
      });
    });
  } else {
    element.css('opacity', 1);
  } 
}


/**
 *  Create an new victim and append it to the list of victims
 *  @param victimID The id of the victim to update
 *  @param probeRequest the probe request line to add to the list
 */
function updateVictim(victim) {
  var id = '#'+ victim._id;
  var hostName = victim.hostName;
  var knownFor = victim.knownFor;
  var probeRequest = victim.probeRequest;

  $(id).find('h2').html(hostName);
  $(id).find('h3').html(knownFor);

  var ul = $(id).find('ul');
  var probe = $('<li>'+ probeRequest +'</li>');
  probe.appendTo(ul).css('opacity', 0);
  
  if ( time > 5 ) {
    calculatePosition(id, function(position) {
      $('body').animate({
        scrollTop: position
      }, 300, function() {
        setTimeout(function() {
          probe.css('opacity', 1);
        }, 100);
      });
    }); 
  } else {
    probe.css('opacity', 1);
  }
}


/**
 *  Calculates the scroll to position, bottom of list and passes it to a callback function
 *  @param element jquery element
 *  @callback callback
 */
function calculatePosition(element, callback) {
  var position = ( ( $(element).offset().top + $(element).find('ul').height() ) - $(window).height() ) + 300;
  callback(position);
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