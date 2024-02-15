"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("suppliers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.NUMERIC,
      },
      ref_id: {
        allowNull: false,
        type: Sequelize.NUMERIC,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      email: { defaultValue: null, type: Sequelize.TEXT },
      user_status: { defaultValue: false, type: Sequelize.BOOLEAN },
      verified_status: { defaultValue: false, type: Sequelize.BOOLEAN },
      supplier_number: { defaultValue: null, type: Sequelize.STRING },
      vendor_site_code: { defaultValue: null, type: Sequelize.STRING },
      created_at: {
        defaultValue: Sequelize.NOW,
        allowNull: false,
        type: Sequelize.DATE,
      },
      created_by_id: {
        defaultValue: 1,
        allowNull: false,
        type: Sequelize.NUMERIC,
      },
      updated_at: {
        defaultValue: null,
        type: Sequelize.DATE,
      },
      updated_by_id: {
        defaultValue: null,
        type: Sequelize.NUMERIC,
      },
      deleted_at: {
        defaultValue: null,
        type: Sequelize.DATE,
      },
      deleted_by_id: {
        defaultValue: null,
        type: Sequelize.NUMERIC,
      },
      // Other fields...
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("suppliers");
  },
};
