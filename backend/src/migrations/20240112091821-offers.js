"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "offers",
      {
        id: {
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
          type: Sequelize.NUMERIC,
        },

        submission_date: {
          defaultValue: Sequelize.NOW,
          type: Sequelize.DATE,
        },
        supplier_id: {
          allowNull: false,
          type: Sequelize.NUMERIC,
        },
        po_number: {
          defaultValue: null,
          type: Sequelize.STRING,
        },
        po_qty: {
          defaultValue: null,
          type: Sequelize.NUMERIC,
          validate: {
            isInt: true,
          },
        },
        po_outs: {
          // allowNull: false,
          defaultValue: null,
          type: Sequelize.NUMERIC,
          validate: {
            isInt: true,
          },
        },
        sku_code: {
          allowNull: false,
          defaultValue: null,
          type: Sequelize.STRING,
        },
        sku_name: {
          allowNull: false,
          defaultValue: null,
          type: Sequelize.STRING,
        },
        qty_delivery: {
          allowNull: false,
          defaultValue: null,
          type: Sequelize.NUMERIC,
          validate: {
            isInt: true,
          },
        },
        est_delivery: {
          defaultValue: Sequelize.NOW,
          type: Sequelize.DATE,
        },

        revised_qty: { defaultValue: null, type: Sequelize.NUMERIC },
        est_revised_date: {
          defaultValue: null,
          type: Sequelize.DATE,
        },
        submitted_qty: {
          defaultValue: null,
          type: Sequelize.NUMERIC,
          validate: {
            isInt: true,
          },
        },
        est_submitted_date: { defaultValue: null, type: Sequelize.DATE },
        gr_qty: {
          defaultValue: null,
          type: Sequelize.NUMERIC,
          validate: {
            isInt: true,
          },
        },
        flag_status: { defaultValue: "A", type: Sequelize.STRING },
        buyer_id: { defaultValue: null, type: Sequelize.NUMERIC },
        notes: { defaultValue: null, type: Sequelize.TEXT },
        edit_from_id: { defaultValue: null, type: Sequelize.NUMERIC },
        is_edit: { defaultValue: false, type: Sequelize.BOOLEAN },
        split_from_id: { defaultValue: null, type: Sequelize.NUMERIC },
        is_split: { defaultValue: false, type: Sequelize.BOOLEAN },
        created_by_id: {
          defaultValue: null,
          type: Sequelize.NUMERIC,
        },
        created_at: { defaultValue: null, type: Sequelize.DATE },
        updated_by_id: { defaultValue: null, type: Sequelize.NUMERIC },
        updated_at: { defaultValue: null, type: Sequelize.DATE },
        deleted_by_id: { defaultValue: null, type: Sequelize.NUMERIC },
        deleted_at: { defaultValue: null, type: Sequelize.DATE },
      },
      { schema: process.env.NODE_MSSQL_MAINSCHEMA }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("offers");
  },
};
