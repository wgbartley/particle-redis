particle-redis
===============

A simple Node.JS daemon that listens for published events on your Particle event stream, parses them, and "processes" them with Redis.

This originally started as a clone of [particle-statsd](https://github.com/wgbartley/particle-statsd).


Installation
------------

1. Clone this repository
2. Change to repo directory (`cd particle-redis`)
3. Run `npm install` to install dependencies
4. Run using `node particle-statsd.js` or use any process manager (nodemon, foreverjs, pm2)


Options
-------
Options are now set via environment variables.  Available options are:

 - `ACCESS_TOKEN` - (Required) Your Particle cloud access token
 - `EVENT_NAME` - The name of the event to listen for - default: `redis/`


Command Format
--------------
As of this writing (as a proof-of-concept), this script only supports the REDIS `SET` and `GET` commands.

To send a command, call `Particle.publish("redis/set", "my_key,my_key_value")` in your firmware code for a `SET` operation,
or `Particle.publish("redis/get", "my_key")` in your firmware code for a `GET` operation.  The script currently replies
with a published event to the `redis/response` event name.  In the `SET` operation example, you can specify anything after
the comma (`,`) as long as it fits within the maximum data length of `Particle.publish()` (currently 255 characters) and
the value is properly escaped.
