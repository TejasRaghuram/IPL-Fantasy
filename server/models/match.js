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
    date: DataTypes.DATE,
    data: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Match',
  });
  return Match;
};