var rp = require('request-promise');
var twitter = require('twitter');
var config = require('./config.json');
var fs = require('fs');
var Twitter = require('twitter');
var timeBetweenFetches = 30 * 1000;

var seenIds = new Set();

var client = new Twitter({
  consumer_key: config.twitterConsumerKey,
  consumer_secret: config.twitterConsumerSecret,
  access_token_key: config.twitterAccessToken,
  access_token_secret: config.twitterAccessSecret
});

var args = process.argv.slice(2);

var filePromise = openFile(args[0]);
var tweetPromise = getPatTweets();
var lastTweetId = args.length === 2 ? args[1] : null;

console.log(lastTweetId);

Promise.all([filePromise, tweetPromise])
  .then(function(results) {
    var tweets = results[1];
    var fileDescriptor = results[0];
    logTweetsAndReFetch(fileDescriptor, tweets);
  })
  .catch(function (err) {
    console.log(err);
  });

function logTweetsAndReFetch(fileDescriptor, tweets) {
  tweets.forEach(function(tweet, i) {
    if (seenIds.has(tweet.id_str)) return;
    var prunedTweet = pruneTweet(tweet.text); 
    if(prunedTweet.length) {
	fs.appendFile(fileDescriptor, prunedTweet);
	console.log(prunedTweet);
    }
    seenIds.add(tweet.id_str);
  });

  if (!tweets.length) {
	console.log("Finished crawling, got " + seenIds.length + " tweets.");
	return;
  }
  setTimeout(function() {
    getPatTweets(tweets[tweets.length - 1].id_str)
      .then(function(newTweets) {
        logTweetsAndReFetch(fileDescriptor, newTweets);
      });
  }, timeBetweenFetches);

}

function pruneTweet(text) {
  text = text.replace(/@\w+ /g, '');
  text = text.replace(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[.\!\/\\w]*))?)/ig, '');
  text += '\n';

  return text;
}

function getPatTweets(max_id) {
  var opts = {screen_name: 'hipatark', count: 200, trim_user: true, include_rts: false, max_id: max_id};
  return new Promise(function (resolve, reject) {
    client.get('statuses/user_timeline', opts, function(err, tweets, resp) {
      if (err) {
        reject(err);
        return;
      }
      else {
        resolve(tweets);
      }
    });
  });
}

function openFile(path) {
  return new Promise(function(resolve, reject) {
    fs.open(path, 'a', function(err, fd) {
      if (err) {
        reject(err);
      } else {
        resolve(fd);
      }
    });
  });
}
