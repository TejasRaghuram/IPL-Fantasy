'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('squads', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      league: {
        type: Sequelize.STRING
      },
      username: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      points: {
        type: Sequelize.INTEGER
      },
      base_points: {
        type: Sequelize.INTEGER
      },
      bonus_points: {
        type: Sequelize.INTEGER
      },
      bonuses: {
        type: Sequelize.ARRAY(Sequelize.JSON)
      },
      captain: {
        type: Sequelize.STRING
      },
      vice_captain: {
        type: Sequelize.STRING
      },
      players: {
        type: Sequelize.ARRAY(Sequelize.JSON)
      },
      runs: {
        type: Sequelize.INTEGER
      },
      fours: {
        type: Sequelize.INTEGER
      },
      sixes: {
        type: Sequelize.INTEGER
      },
      ducks: {
        type: Sequelize.INTEGER
      },
      half_centuries: {
        type: Sequelize.INTEGER
      },
      centuries: {
        type: Sequelize.INTEGER
      },
      strike_rate: {
        type: Sequelize.FLOAT
      },
      not_outs: {
        type: Sequelize.INTEGER
      },
      balls_faced: {
        type: Sequelize.INTEGER
      },
      batting_average: {
        type: Sequelize.FLOAT
      },
      dismissals: {
        type: Sequelize.INTEGER
      },
      wickets: {
        type: Sequelize.INTEGER
      },
      dots: {
        type: Sequelize.INTEGER
      },
      four_wicket_hauls: {
        type: Sequelize.INTEGER
      },
      five_wicket_hauls: {
        type: Sequelize.INTEGER
      },
      six_wicket_hauls: {
        type: Sequelize.INTEGER
      },
      maidens: {
        type: Sequelize.INTEGER
      },
      hat_tricks: {
        type: Sequelize.INTEGER
      },
      economy: {
        type: Sequelize.FLOAT
      },
      bowling_average: {
        type: Sequelize.FLOAT
      },
      bowling_strike_rate: {
        type: Sequelize.FLOAT
      },
      balls_bowled: {
        type: Sequelize.INTEGER
      },
      runs_conceded: {
        type: Sequelize.INTEGER
      },
      catches: {
        type: Sequelize.INTEGER
      },
      stumpings: {
        type: Sequelize.INTEGER
      },
      player_of_matches: {
        type: Sequelize.INTEGER
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Squads');
  }
};