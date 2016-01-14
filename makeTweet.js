var Markov = require('markov'),
	fs = require('fs'),
	config = require('./config.json'),
	Twitter = require('twitter'),
  client = new Twitter({
    consumer_key: config.twitterConsumerKey,
    consumer_secret: config.twitterConsumerSecret,
    access_token_key: config.twitterAccessToken,
		access_token_secret: config.twitterAccessSecret
  });

var pat = Markov(Math.round(Math.random() + 1));
var fd = fs.createReadStream(__dirname + '/pat.txt');
var noop = function(){};

pat.seed(fd, function() {
	var res = [];

	while (res.length < 3) {
		res = pat.forward(pat.pick());
	}

	client.post('statuses/update',
		{status: res.join(' ')},
		config.twitterAccessToken,
		config.twitterAccessSecret,
		noop);
});
