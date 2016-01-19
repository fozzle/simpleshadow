const Sequelize = require('sequelize'),
  config = require('./config.json');

const sequelize = new Sequelize('tweets', 'noop', 'noop', {
  storage: __dirname + '/' + config.dbFile,
  dialect: 'sqlite',
  logging: false
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

module.exports = {
  sequelize: sequelize,
  Tweet: Tweet
}
