"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      { tableName: "offers", schema: process.env.NODE_MSSQL_MAINSCHEMA },
      [],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     
     */ await queryInterface.bulkDelete("offers", null, {});
  },
};
