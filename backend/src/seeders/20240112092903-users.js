"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      { tableName: "users", schema: process.env.NODE_MSSQL_MAINSCHEMA },
      [
        {
          user_id: "superuser",
          name: "Super User",
          password:
            "$2a$04$3d1O745ShmWJJabf8X54XuSbP7oBjdmlghUuKpRi5cPf.MUqGtK66",
          role_id: 1,
          supplier_id: 624,
          created_at: new Date("2021-08-02"),
          created_by_id: 1,
          updated_at: new Date("2022-08-28"),
        },
        {
          user_id: "ppictest",
          name: "PPIC Dummy",
          password:
            "$2a$04$3d1O745ShmWJJabf8X54XuSbP7oBjdmlghUuKpRi5cPf.MUqGtK66",
          role_id: 2,
          created_at: new Date("2021-08-02"),
          created_by_id: 1,
          updated_at: new Date("2022-08-28"),
        },
        {
          user_id: "proctest",
          name: "Procurement Dummy",
          password:
            "$2a$04$3d1O745ShmWJJabf8X54XuSbP7oBjdmlghUuKpRi5cPf.MUqGtK66",
          role_id: 3,
          created_at: new Date("2021-08-02"),
          created_by_id: 1,
          updated_at: new Date("2022-08-28"),
        },
        {
          user_id: "suptest",
          name: "Supplier Dummy",
          password:
            "$2a$04$3d1O745ShmWJJabf8X54XuSbP7oBjdmlghUuKpRi5cPf.MUqGtK66",
          role_id: 4,
          supplier_id: 624,
          // 372065,
          created_at: new Date("2021-08-02"),
          created_by_id: 1,
          updated_at: new Date("2022-08-28"),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
