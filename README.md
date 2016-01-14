Twitter Shadow Bot Kit
======================

Make a quick and dirty markov twitter bot based on a target Twitter account. Seed your data once with the scraper, then keep your corpus up to date with SQLite persistence.

Usage
-----

First setup a config.json as follows:

```javascript
{
  twitterConsumerKey: "<your Twitter consumer key>",
  twitterConsumerSecret: "<your Twitter consumer secret>",
  accessTokenKey: "<your Twitter access token key>",
  accessTokenSecret: "<your Twitter access token secret>",
  dbFile: "<filename of sqlite db (will be created if doesn't exist)>"
}
```

You'll probably want to get these from the Twitter account that you created for the bot. Otherwise you may create posts on your own Twitter timeline!

Then we will collect tweets from the Twitter API and store them in our DB by running the scrapeTweets script. It's usage is detailed below:

```
node scrapeTweets.js -i <flag indicating initial scrape [optional]> <twitter handle>
```

Now we can make our first tweet, by running `node makeTweet.js`. Check your bot's timeline, it will have posted a tweet constructed from the data we gathered earlier!

From here you can use cron to schedule your tweeting and scraping as necessary.

More Options
------------
