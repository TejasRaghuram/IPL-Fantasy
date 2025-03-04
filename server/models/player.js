'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Player extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Player.init({
    name: DataTypes.STRING,
    team: DataTypes.STRING,
    position: DataTypes.STRING,
    base_points: DataTypes.INTEGER,
    bonus_points: DataTypes.INTEGER,
    bonuses: DataTypes.ARRAY(DataTypes.JSON),
    points: DataTypes.INTEGER,
    runs: DataTypes.INTEGER,
    fours: DataTypes.INTEGER,
    sixes: DataTypes.INTEGER,
    ducks: DataTypes.INTEGER,
    half_centuries: DataTypes.INTEGER,
    centuries: DataTypes.INTEGER,
    strike_rate: DataTypes.FLOAT,
    balls_faced: DataTypes.INTEGER,
    batting_average: DataTypes.FLOAT,
    not_outs: DataTypes.INTEGER,
    dismissals: DataTypes.INTEGER,
    highest_score: DataTypes.INTEGER,
    wickets: DataTypes.INTEGER,
    dots: DataTypes.INTEGER,
    four_wicket_hauls: DataTypes.INTEGER,
    five_wicket_hauls: DataTypes.INTEGER,
    six_wicket_hauls: DataTypes.INTEGER,
    maidens: DataTypes.INTEGER,
    hat_tricks: DataTypes.INTEGER,
    economy: DataTypes.FLOAT,
    bowling_average: DataTypes.FLOAT,
    bowling_strike_rate: DataTypes.FLOAT,
    balls_bowled: DataTypes.INTEGER,
    runs_conceded: DataTypes.INTEGER,
    catches: DataTypes.INTEGER,
    stumpings: DataTypes.INTEGER,
    player_of_matches: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Player',
    underscored: true
  });
  return Player;
};