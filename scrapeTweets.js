const twitter = require('twitter'),
  config = require('./config.json'),
  fs = require('fs'),
  parseArgs = require('minimist'),
  Twitter = require('twitter'),
  models = require('./models'),
  timeBetweenFetches = 1 * 1000;

const client = new Twitter({
  consumer_key: config.twitterConsumerKey,
  consumer_secret: config.twitterConsumerSecret,
  access_token_key: config.twitterAccessToken,
  access_token_secret: config.twitterAccessSecret
});

const args = parseArgs(process.argv.slice(2));
const screenName = args._[0];

models.sequelize.sync({force: false}).then(crawlCycle);

function storeTweets(tweets) {
  tweets = tweets.map(function(tweet) {
    return {text: pruneTweet(tweet.text), tweetId: tweet.id_str};
  }).filter(function(tweet) {
    return tweet.text !== "";
  })

  tweets.forEach(function(tweet) {
    models.Tweet.upsert(tweet);
  });

  if (!tweets.length) {
    models.Tweet.count().then(function(count) {
      console.log("Finished crawling, got " + count + " tweets.");
    });
    return;
  }

  setTimeout(crawlCycle, timeBetweenFetches);
}

function crawlCycle() {
  const sortBy = args.i ? 'ASC' : 'DESC';
  const optionField = args.i ? 'maxId' : 'sinceId';
  models.Tweet
  .findOne({
    order: [
      ['tweetId', sortBy]
    ]
  })
  .then(function(tweet) {
    var opts = {
      screenName: screenName
    }

    if (tweet) {
      opts[optionField] = tweet.tweetId
    }

    return getTweets(opts)
  })
  .then(storeTweets)
  .catch(function(err) {
    console.error(err);
  });

}

function pruneTweet(text) {
  text = text.replace(/@\w+/g, '');
  text = text.replace(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[.\!\/\\w]*))?)/ig, '');
  text = text.trim();

  return text;
}

function getTweets(opts) {
  opts = {
    screen_name: opts.screenName,
    count: 200,
    trim_user: true,
    include_rts: false,
    max_id: opts.maxId,
    since_id: opts.sinceId
  };

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
