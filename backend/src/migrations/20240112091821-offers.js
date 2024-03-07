"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("offers", {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.NUMERIC,
      },

      submission_date: {
        defaultValue: Sequelize.NOW,
        type: Sequelize.DATE,
      },

      supplier_id: {
        type: Sequelize.NUMERIC,
        references: {
          model: "SUPPLIERS",
          key: "ref_id",
        },
      },
      po_number: {
        defaultValue: null,
        type: Sequelize.STRING,
      },
      category_filter: {
        defaultValue: null,
        type: Sequelize.STRING,
      },
      io_filter: {
        defaultValue: null,
        type: Sequelize.STRING,
      },
      line_num: {
        defaultValue: null,
        type: Sequelize.NUMERIC,
        validate: {
          isInt: true,
        },
      },
      po_qty: {
        defaultValue: null,
        type: Sequelize.FLOAT,
      },
      po_outs: {
        // allowNull: false,
        defaultValue: null,
        type: Sequelize.FLOAT,
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
        type: Sequelize.FLOAT,
      },
      est_delivery: {
        defaultValue: Sequelize.NOW,
        type: Sequelize.DATE,
      },
      hutang_kirim: {
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      },
      revised_qty: { defaultValue: null, type: Sequelize.FLOAT },
      est_revised_date: {
        defaultValue: null,
        type: Sequelize.DATE,
      },
      submitted_qty: {
        defaultValue: null,
        type: Sequelize.FLOAT,
      },
      est_submitted_date: { defaultValue: null, type: Sequelize.DATE },
      gr_qty: {
        defaultValue: null,
        type: Sequelize.NUMERIC,
      },
      flag_status: { defaultValue: "A", type: Sequelize.STRING },
      buyer_id: { defaultValue: null, type: Sequelize.NUMERIC },
      notes: { defaultValue: null, type: Sequelize.TEXT },
      history: { defaultValue: null, type: Sequelize.TEXT },
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
    });
  },
  async down(queryInterface, Sequelize) {
    // await queryInterface.dropTable("offers");
  },
};
