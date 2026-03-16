'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Match extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Match.init({
    match_id: DataTypes.STRING,
    title: DataTypes.STRING,
    stadim: DataTypes.STRING,
    team1: DataTypes.STRING,
    team2: DataTypes.STRING,
    team1_score: DataTypes.STRING,
    team2_score: DataTypes.STRING,
    result: DataTypes.STRING,
    date: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Match',
    underscored: true
  });
  return Match;
};