const twitter = require('twitter'),
  config = require('./config.json'),
  fs = require('fs'),
  Twitter = require('twitter'),
  Sequelize = require('sequelize'),
  timeBetweenFetches = 30 * 1000;

const client = new Twitter({
  consumer_key: config.twitterConsumerKey,
  consumer_secret: config.twitterConsumerSecret,
  access_token_key: config.twitterAccessToken,
  access_token_secret: config.twitterAccessSecret
});

const args = process.argv.slice(2);
const screenName = args[0];
const sequelize = new Sequelize('tweets', 'noop', 'noop', {
  storage: __dirname + '/' + args[1],
  dialect: 'sqlite'
});

const Tweet = sequelize.define('Tweet', {
  text: {
    type: Sequelize.STRING(160),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  tweetId: {
    type: Sequelize.BIGINT,
    unique: true
  }
}, {
  freezeTableName: true
});

sequelize.sync({force: false}).then(crawlCycle);

function storeTweets(tweets) {
  tweets = tweets.map(function(tweet) {
    console.log(tweet);
    return {text: pruneTweet(tweet.text), tweetId: tweet.id_str};
  }).filter(function(tweet) {
    return tweet.text !== "";
  })

  tweets.forEach(function(tweet) {
    Tweet.upsert(tweet);
  });

  // (tweets, {validate: true});

  if (!tweets.length) {
    Tweet.count().then(function(count) {
      console.log("Finished crawling, got " + count + " tweets.");
    });
    return;
  }

  setTimeout(crawlCycle, timeBetweenFetches);
}

function crawlCycle() {
  Tweet
  .findOne({
    order: [
      ['tweetId', 'ASC']
    ]
  })
  .then(function(last) {
    var opts = {
      screenName: screenName
    }

    if (last) {
      opts.maxId = last.tweetId
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
    count: 200, trim_user: true,
    include_rts: false,
    max_id: opts.maxId
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
