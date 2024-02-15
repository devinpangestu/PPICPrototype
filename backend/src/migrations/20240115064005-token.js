"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("token", {
      expired_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      id: {
        primaryKey: true,
        allowNull: false,
        type: Sequelize.STRING,
      },
      issued_at: {
        defaultValue: Sequelize.NOW,
        allowNull: false,
        type: Sequelize.DATE,
      },
      logout_at: {
        defaultValue: null,
        type: Sequelize.DATE,
      },
      type: {
        defaultValue: "access",
        type: Sequelize.STRING,
      },
      token: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      user_id: {
        allowNull: false,
        type: Sequelize.NUMERIC,
      },
      // Other fields...
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("token");
  },
};
