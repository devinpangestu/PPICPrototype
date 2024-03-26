"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      { tableName: "roles", schema: process.env.NODE_MSSQL_MAINSCHEMA },
      [
        {
          permissions:
            "ppic@view,ppic@create,ppic@edit,ppic@delete,supplier@view,supplier@create,supplier@edit,supplier@delete,purchasing@admin,purchasing@view,purchasing@create,purchasing@edit,purchasing@delete,user@view,user@create,user@edit,user@delete",
          desc_: "Super User",
          super_user: 1,
        },
        {
          permissions: "ppic@view,ppic@create,ppic@edit,ppic@delete",
          desc_: "PPIC",
          super_user: 0,
        },
        {
          permissions:
            "purchasing@admin,purchasing@view,purchasing@create,purchasing@edit,purchasing@delete",
          desc_: "Purchasing Admin",
          super_user: 0,
        },
        {
          permissions:
            "purchasing@view,purchasing@create,purchasing@edit,purchasing@delete",
          desc_: "Purchasing",
          super_user: 0,
        },
        {
          permissions:
            "supplier@view,supplier@create,supplier@edit,supplier@delete",
          desc_: "Supplier",
          super_user: 0,
        },
        {
          permissions: "ppic@view",
          desc_: "QA/QC",
          super_user: 0,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    // await queryInterface.bulkDelete("roles", null, {});
  },
};
