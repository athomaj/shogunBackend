/**
 * This file is where you define your application routes and controllers.
 *
 * Start by including the middleware you want to run for every request;
 * you can attach middleware to the pre('routes') and pre('render') events.
 *
 * For simplicity, the default setup for route controllers is for each to be
 * in its own file, and we import all the files in the /routes/views directory.
 *
 * Each of these files is a route controller, and is responsible for all the
 * processing that needs to happen for the route (e.g. loading data, handling
 * form submissions, rendering the view template, etc).
 *
 * Bind each route pattern your application should respond to in the function
 * that is exported from this module, following the examples below.
 *
 * See the Express application routing documentation for more information:
 * http://expressjs.com/api.html#app.VERB
 */

var keystone = require('keystone');
var middleware = require('./middleware');
var restful = require('restful-keystone')(keystone);
var importRoutes = keystone.importer(__dirname);
var User = require('../models/User')
var Gallery = require('../models/Gallery')
const uuidv1 = require('uuid/v1');
// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Import Route Controllers
var routes = {
	views: importRoutes('./views'),
};

const keyFilename="../shogun-adb49-firebase-adminsdk-7vhb1-b8502cbfbd.json"; //replace this with api key file
const projectId = "shogun-adb49" //replace with your project id
const bucketName = `${projectId}.appspot.com`;

const gcs = require('@google-cloud/storage')({
    projectId,
    keyFilename
});

const bucket = gcs.bucket(bucketName);

function createEvent(req, res, next) {
	console.log('HERE');
	var event = keystone.list('Gallery')
	var newEvent = new event.model()

	var QRCode = require('qrcode')

	const eventId = uuidv1();
	QRCode.toFile('./myqrcode.png', eventId, function (err, url) {
		bucket.upload('./myqrcode.png',{
		    public:true,
		}, function(err, file) {
		    if(err)
		    {
		        console.log(err);
		        return;
		    }
				console.log(file);
				newEvent.name = req.body.name;
				newEvent.id = eventId;
				newEvent.qrCode = {
	        "width": 200,
	        "height": 200,
	        "format": "png",
	        "resource_type": "image",
	        "url": file.metadata.mediaLink,
	        "secure_url": file.metadata.mediaLink}
				newEvent.save();
				res.status(200).send({data: 'created'})
		});
	})
//	newEvent
}

// Setup Route Bindings
exports = module.exports = function (app) {
	// Views
	app.get('/', routes.views.index);
	app.get('/gallery', routes.views.gallery);

	restful.expose({
    User: true,
		Gallery: true
  }).before("create", {
		Gallery: createEvent
	})
	.start();

	// NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
	// app.get('/protected', middleware.requireUser, routes.views.protected);

};
