/**
 * Probe Response API
 * @author Bram de Leeuw
 *
 * API for saving victim data in an local database
 */

/**
 *  Load in dependencies
 */
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io').listen(http);
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
var moment = require('moment');


/**
 *  Load in controllers
 */
var victimController = require('./controllers/victim');
var ssidController = require('./controllers/SSID');


/**
 *  Connect to the database
 */
mongoose.connect('mongodb://localhost/probe_response_database_dev_v1');


/**
 *  Set up Express app
 */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/assets'));
app.set('view engine', 'jade');
app.set('port', (process.env.PORT || 5000));
app.locals.moment = moment;


/**
 *  Set up routs
 */
var apiRouter = express.Router();
var baseRouter = express.Router();
var emitRouter = express.Router();


/**
 *  Create endpoint handlers for /
 *  @method   GET   Returns a page
 *  TODO: Uitwerken voor gebruik met DNS Spoof, welke data ga ik hier laten zien?
 *        Data van de kijker?  
 */
baseRouter.route('/')
  .get(function(req, res) {
    victimController.getVictimsAsData('24:e3:14:5a:07:76', function(data) {

      res.render('index', {data: data});
    });
  })


/**
 *  Create endpoint handlers for /emit
 *  @method   POST   Posts the color to emit to all connected clients
 */
emitRouter.route('/color')
  .head(cors(), function(req, res){ res.send(204) })
  .post(cors(), function(req, res) {
    var color = req.body.color;

    io.emit('color', {
      color: color
    });

    res.json({ message: 'Animating clients to '+ color });
  });

io.on('connection', function(socket){
  console.log('client connected with id:', socket.id, 'and ip:', socket.conn.remoteAddress);
});

victimController.setupSocket(io);

/**
 *  Create endpoint handlers for /victims
 *  @method   POST  Create a new victim
 *  @method   GET   Array with all victim objects
 */
apiRouter.route('/victims')
  .head(cors(), function(req, res){ res.send(204) })
  .post(cors(), victimController.postVictim )
  .get(cors(), victimController.getVictims);


apiRouter.route('/victimswithhostnames')
  .head(cors(), function(req, res){ res.send(204) })
  .get(cors(), victimController.getVictimsWithHostNames);


/**
 *  Create endpoint handlers for /victims/:mac
 *  @method   GET     Get one victim object by it's mac address
 *  @method   PUT     Update one victim object by it's mac address  TODO: check if obsolete method
 *  @method   DELETE  Delete one victim object by it's mac address  TODO: connecties met andere documetnen opschonen na delete
 */
apiRouter.route('/victims/:mac')
  .head(cors(), function(req, res){ res.send(204) })
  .get(cors(), victimController.getVictim)
  .put(cors(), victimController.putVictim)
  .delete(cors(), victimController.deleteVictim);


/**
 *  Create endpoint handlers for /ssids
 *  @method   GET  Get all SSID objects
 */
apiRouter.route('/ssids')
  .head(cors(), function(req, res){ res.send(204) })
  .get(cors(), ssidController.getSSIDs);


/**
 *  Create endpoint handlers for /ssids/:mac
 *  @method   DELETE  Delete one SSID object by it's mac address  TODO: connecties met andere documetnen opschonen na delete
 */
apiRouter.route('/ssids/:mac')
  .head(cors(), function(req, res){ res.send(204) })
  .get(cors(), ssidController.getSSID)
  .delete(cors(), ssidController.deleteSSID);


/**
 *  Register all our routes with /api
 */
app.use('/api', cors(), apiRouter);
app.use('/emit', cors(), emitRouter);
app.use('/', baseRouter);


/**
 *  Start the app and listen on port 5000
 */
http.listen(app.get('port'), function() {
  console.log("Probe Response API is running at localhost:" + app.get('port'));
})