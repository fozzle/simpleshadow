const Markov = require('markov'),
  fs = require('fs'),
  config = require('./config.json'),
  parseArgs = require('minimist'),
  Twitter = require('twitter'),
  models = require('./models'),
  Stream = require('stream'),
  client = new Twitter({
    consumer_key: config.twitterConsumerKey,
    consumer_secret: config.twitterConsumerSecret,
    access_token_key: config.twitterAccessToken,
    access_token_secret: config.twitterAccessSecret
  });

const noop = function(){};

const markov = Markov(Math.round(Math.random() + 1));

models.Tweet.findAll().then(function(tweets) {
  const stream = new Stream.Readable();
  stream._read = noop;
  tweets.forEach(function(tweet) {
    stream.push(tweet.text + '\n');
  });

  stream.push(null);

  markov.seed(stream, function() {
    var res = [];

    while (res.length < 3) {
      res = markov.forward(markov.pick());
    }

    postTweet(res.join(' '));
  });
});

function postTweet(text) {
  client.post('statuses/update', {status: text}, noop);
}
