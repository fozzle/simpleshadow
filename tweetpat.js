var Markov = require('markov'),
	fs = require('fs'),
	config = require('./config.json'),
	twitterAPI = require('node-twitter-api'),
  twitter = new twitterAPI({
    consumerKey: config.twitterConsumerKey,
    consumerSecret: config.twitterConsumerSecret,
    callback: ''
  });

var pat = Markov(1);
var fd = fs.createReadStream(__dirname + '/pat.txt');

pat.seed(fd, function() {
	var res = [];

	while (res.length < 3) {
		res = pat.forward(pat.pick());
	}

	twitter.statuses('update',
		{status: res.join(' ')},
		config.twitterAccessToken,
		config.twitterAccessSecret);
});
