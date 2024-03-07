"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.NUMERIC,
      },
      user_id: {
        defaultValue: null,
        type: Sequelize.STRING,
      },
      name: {
        defaultValue: null,
        type: Sequelize.STRING,
      },
      password: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      last_used_password: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      email: {
        defaultValue: null,
        type: Sequelize.STRING,
      },
      role_id: {
        defaultValue: 3,
        allowNull: false,
        type: Sequelize.NUMERIC,
      },
      oracle_username: {
        defaultValue: null,
        type: Sequelize.STRING,
      },
      supplier_id: {
        defaultValue: null,
        type: Sequelize.NUMERIC,
        references: {
          model: "SUPPLIERS",
          key: "ref_id",
        },
      },
      failed_login_attempts: {
        defaultValue: 0,
        type: Sequelize.NUMERIC,
      },
      last_failed_login: { defaultValue: null, type: Sequelize.DATE(6) },
      password_changed_at: {
        defaultValue: null,
        type: Sequelize.DATE(6),
      },
      account_lock_timestamp: {
        defaultValue: null,
        type: Sequelize.DATE(6),
      },
      account_lock_count: {
        defaultValue: 0,
        type: Sequelize.NUMERIC,
      },
      created_at: {
        defaultValue: Sequelize.NOW,
        allowNull: false,
        type: Sequelize.DATE(6),
      },
      created_by_id: {
        defaultValue: 1,
        allowNull: false,
        type: Sequelize.NUMERIC,
      },
      updated_at: {
        defaultValue: null,
        type: Sequelize.DATE(6),
      },
      updated_by_id: {
        defaultValue: null,
        type: Sequelize.NUMERIC,
      },
      deleted_at: {
        defaultValue: null,
        type: Sequelize.DATE(6),
      },
      deleted_by_id: {
        defaultValue: null,
        type: Sequelize.NUMERIC,
      },
      // Other fields...
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("users");
  },
};
