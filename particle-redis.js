// Require required stuff
var udp   = require('dgram').createSocket('udp4'),
    spark = require('spark'),
    R     = require("redis").createClient();


// Require variables
var ACCESS_TOKEN = (process.env.ACCESS_TOKEN ? process.env.ACCESS_TOKEN : '').trim();


// Optional variables
var EVENT_NAME = (process.env.EVENT_NAME ? process.env.EVENT_NAME : 'redis/');


// I said it was required!
if(ACCESS_TOKEN.length==0) {
	console.error('You MUST provide an access token');
	process.exit(1);
}


// Login to the cloud
spark.login({accessToken: ACCESS_TOKEN}, function() {
	subscribe_event();
});


// Subscription handler
function subscribe_event() {
	console.time('subscribe');
	_log('subscription started');

	// Subscribe
	var req = spark.getEventStream(EVENT_NAME, 'mine', function(data) {
		data_parse(data);
	});

	// Re-subscribe
	req.on('end', function() {
		_log('subscription ended');
		console.time('subscribe');

		// Re-subscribe in 1 second
		setTimeout(subscribe_event, 1000);
	});
}


// Parse the data from the event
function data_parse(data) {
	var msg, device_name;

	// The channel is the event name
	var channel = data.name;

	// The command is what follows after the slash
	var command = channel.split("/")[1].toUpperCase();

	// Grab the "payload"
	var payload = data.data;

	// Figure out the key
	if(payload.indexOf(",")>=0)
		var key = payload.substr(0, payload.indexOf(","));
	else
		var key = payload;

	// Parse out anything following the key
	if(payload.indexOf(",")>0) {
		var val = payload.substr(payload.indexOf(",")+1);
	}


	_log('<<<', data);

	switch(command) {
		case 'SET':
			R.set(key, val);
			break;
		case 'GET':
			var response = R.get(key, function(err, resp) {
				spark.publishEvent("redis/response", JSON.stringify(resp));
				_log('>>>', "redis/response", JSON.stringify(resp));
			});
			break;
	}
}


// Semi-fancy logging with timestamps
function _log() {
	var d = new Date();

	// Year
	d_str = d.getFullYear();
	d_str += '-';

	// Month
	if(d.getMonth()+1<10) d_str += '0';
	d_str += (d.getMonth()+1);
	d_str += '-';

	// Day
	if(d.getDate()<10) d_str += '0';
	d_str += d.getDate();
	d_str += ' ';

	// Hour
	if(d.getHours()<10) d_str += '0';
	d_str += d.getHours();
	d_str += ':';

	// Minute
	if(d.getMinutes()<10) d_str += '0';
	d_str += d.getMinutes();
	d_str += ':';

	// Second
	if(d.getSeconds()<10) d_str += '0';
	d_str += d.getSeconds();
	d_str += '.';

	// Milliseconds
	d_str += d.getMilliseconds();


	if(arguments.length==1)
		var l = arguments[0];
	else {
		var l = [];
		for(var i=0; i<arguments.length; i++)
			l.push(arguments[i]);
	}


	console.log('['+d_str+']', l);
}


// http://stackoverflow.com/a/3710226
function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}