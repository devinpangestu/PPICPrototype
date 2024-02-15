"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "log_transactions",
      {
        id: {
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
          type: Sequelize.NUMERIC,
        },
        offer_id: {
          allowNull: false,
          type: Sequelize.NUMERIC,
        },
        master_log_type:{
          allowNull: false,
          type: Sequelize.STRING,
        },
        log_detail: { allowNull: false, type: Sequelize.TEXT },
        log_timestamp: {
          defaultValue: Sequelize.NOW,
          type: Sequelize.DATE,
        },
      },
      { schema: process.env.NODE_MSSQL_MAINSCHEMA }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("log_transactions");
  },
};
