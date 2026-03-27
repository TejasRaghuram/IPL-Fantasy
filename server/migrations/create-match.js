'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('matches', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      match_id: {
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      stadium: {
        type: Sequelize.STRING
      },
      team1: {
        type: Sequelize.STRING
      },
      team2: {
        type: Sequelize.STRING
      },
      team1_score: {
        type: Sequelize.STRING
      },
      team2_score: {
        type: Sequelize.STRING
      },
      result: {
        type: Sequelize.STRING
      },
      scorecard: {
        type: Sequelize.JSON
      },
      player_of_match: {
        type: Sequelize.STRING
      },
      date: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('matches');
  }
};