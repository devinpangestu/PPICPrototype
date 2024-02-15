"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("roles", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.NUMERIC,
      },
      permissions: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      desc_: {
        type: Sequelize.TEXT,
      },

      super_user: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      // Other fields...
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("roles");
  },
};
