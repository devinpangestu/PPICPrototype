"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      { tableName: "offers", schema: process.env.NODE_MSSQL_MAINSCHEMA },
      [
        {
          
    
          submission_date: new Date("2022-08-28"),
          supplier_id: 624,
          po_number: "PO-0001",
          category_filter: 
          io_filter:
          line_num:
          po_qty:
          po_outs:
          sku_code:
          sku_name:
          qty_delivery:
          est_delivery: 
          hutang_kirim:
          revised_qty: 
          submitted_qty:
          est_submitted_date:
          gr_qty:
          flag_status: 
          buyer_id: 
          notes: 
          history: 
          edit_from_id: 
          is_edit: 
          split_from_id: 
          is_split: 
          created_by_id: 
          created_at: 
          updated_by_id: 
          updated_at: 
          deleted_by_id: 
          deleted_at: 
        },
      ],
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
