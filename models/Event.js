var keystone = require('keystone');
var Types = keystone.Field.Types;
const uuidv1 = require('uuid/v1');

const keyFilename="./shogun-adb49-firebase-adminsdk-7vhb1-b8502cbfbd.json"; //replace this with api key file
const projectId = "shogun-adb49" //replace with your project id
const bucketName = `${projectId}.appspot.com`;

const gcs = require('@google-cloud/storage')({
    projectId,
    keyFilename
});

const bucket = gcs.bucket(bucketName);

/**
 * Gallery Model
 * =============
 */

var Event = new keystone.List('Event');

Event.add({
	name: { type: String, required: true, index: true},
	startDate: { type: Types.Datetime, default: Date.now, required: true, index: true, initial: true},
	endDate: { type: Types.Datetime, default: Date.now, initial: true, required: true, index: true},
	description: { type: Types.Textarea, required: true, initial: true, index: true},
	qrCode: { type: Types.CloudinaryImage },
	images: { type: Types.CloudinaryImages },
  participants: {type: Types.TextArray }
});

Event.schema.pre('save', function(next) {
	const that = this;
	var QRCode = require('qrcode')

	const eventId = uuidv1();
	QRCode.toFile(`./${eventId}.png`, that._id.toString(), function (err, url) {
    console.log(err);
		bucket.upload(`./${eventId}.png`,{
				public:true,
		}, function(err, file) {
				if(err) {
						console.log(err);
						return;
				}
				that.qrCode = {
					"width": 600,
					"height": 600,
					"format": "png",
					"resource_type": "image",
					"url": file.metadata.mediaLink,
					"secure_url": file.metadata.mediaLink}
					console.log(that);
					next();
		});
	})

});

Event.defaultColumns = 'name, startDate, endDate, description';

Event.register();
