var socket = io();
var time = 0;
var timer = {
  start: function(){
    setInterval( function(){ 
      time++;
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
  submitSearch();
  //setUpStickyHeaders('header');

  socket.on('color', function (data) {
    var color = 'hsl('+ ofHueToCSSHue(data.color) +', 100%, 50%)';
    $('body').css('background-color', color);
    $('html').css('background-color', color);
    $('#searchbar').css({
      boxShadow: '0px 12px 24px '+ color,
      backgroundColor: color
    });
    
    //$('#topBar').css('background-color', color);
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
    overflow: 'inherit' 
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


/**
 *  On touch restart the timer
 */
function watchForUserInteraction() {
  $('body').bind('touchmove', function(e) { 
    timer.restart();
  });
}


/**
 *  Submit search with ajax
 */
function submitSearch() {
  $('#searchform').ajaxForm({
    target: '#victims',
    beforeSubmit: function() { 
      $('#victims').css({
        opacity: 0,
        overflow: 'hidden' 
      });
      $('#loading').show();
    },
    success: function() { 
      $('#victims').css({
        opacity: 1,
        overflow: 'inherit' 
      });
      $('#loading').hide();
    }
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

  //console.log($('#victims').find(id));
  if ($('#victims').find(id)) {
    // victim is found so update instead of create
    //console.log('FOUND SO UPDATE:', victim);
    updateVictim(victim);
  } else {

    //console.log('CREATE VICTIM:', victim);

    var html =
      '<section id="'+ id +'">' +
        '<header>' +
          '<h2>'+ hostName +'</h2>' +
          '<h3>'+ knownFor +'</h3>' +
        '</header>' +
        '<main>' +
          '<ul>' +
            '<li>'+ probeRequest + '</li>' +
          '</ul>' +
        '</main>' +
      '</section>';

    var element = $(html);
    element.appendTo('#victims').css('opacity', 0);

    if ( time > 4 ) {
      //console.log('CAN ANIMATE', time);
      var currentPosition = $(window).scrollTop();
      calculatePosition(element, function(position) {
        var sprintTo = currentPosition > position ? position + 500 : position - 500;
        $('body').animate({
          scrollTop: sprintTo
        }, 0, function() {
          $('body').animate({
            scrollTop: position
          }, 300, function() {
            setTimeout(function() {
              element.css('opacity', 1);
            }, 100);
          });
        });
      });
    } else {
      //console.log('CANT ANIMATE', time);
      element.css('opacity', 1);
    } 
  }
}


/**
 *  Create an new victim and append it to the list of victims
 *  @param victimID The id of the victim to update
 *  @param probeRequest the probe request line to add to the list
 */
function updateVictim(victim) {
  var id = victim._id;
  var hostName = victim.hostName;
  var knownFor = victim.knownFor;
  var probeRequest = victim.probeRequest;

  //console.log('UPADTE VICTIM:', victim);

  $('#'+id).find('h2').html(hostName);
  $('#'+id).find('h3').html(knownFor);

  var ul = $('#'+id).find('ul');
  var probe = $('<li>'+ probeRequest +'</li>');
  probe.appendTo(ul).css('opacity', 0);
  
  if ( time > 4 ) {
    //console.log('CAN ANIMATE', time);
    var currentPosition = $(window).scrollTop();
    var element = $('#'+id);
    calculatePosition(element, function(position) {

      var sprintTo = currentPosition > position ? position + 500 : position - 500;
      if (position > currentPosition && position < currentPosition + $(window).height()) {
        sprintTo = currentPosition;
      }

      $('body').animate({
        scrollTop: sprintTo
      }, 0, function() {
        $('body').animate({
          scrollTop: position
        }, 300, function() {
          setTimeout(function() {
            probe.css('opacity', 1);
          }, 100);
        });
      });
    }); 
  } else {
    //console.log('CANT ANIMATE', time);
    probe.css('opacity', 1);
  }
}


/**
 *  Calculates the scroll to position, bottom of list and passes it to a callback function
 *  @param element jquery element
 *  @callback callback
 */
function calculatePosition(elem, callback) {
  var position = ( ( $(elem).offset().top + $(elem).find('ul').height() ) - $(window).height() ) + 300;
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