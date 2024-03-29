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
          password_changed_at: new Date("2021-08-02"),
          last_used_password:
            '["$2a$04$3d1O745ShmWJJabf8X54XuSbP7oBjdmlghUuKpRi5cPf.MUqGtK66"]',
          email: "devinpangestu2000@gmail.com",
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
          password_changed_at: new Date("2021-08-02"),
          last_used_password:
            '["$2a$04$3d1O745ShmWJJabf8X54XuSbP7oBjdmlghUuKpRi5cPf.MUqGtK66"]',
          role_id: 2,
          email: "devinpangestu2000@gmail.com",
          created_at: new Date("2021-08-02"),
          created_by_id: 1,
          updated_at: new Date("2022-08-28"),
        },
        {
          user_id: "procadmin",
          name: "Procurement Admin",
          password:
            "$2a$04$3d1O745ShmWJJabf8X54XuSbP7oBjdmlghUuKpRi5cPf.MUqGtK66",
          password_changed_at: new Date("2021-08-02"),
          last_used_password:
            '["$2a$04$3d1O745ShmWJJabf8X54XuSbP7oBjdmlghUuKpRi5cPf.MUqGtK66"]',
          email: "devinpangestu2000@gmail.com",
          role_id: 3,
          oracle_username: null,
          created_at: new Date("2021-08-02"),
          created_by_id: 1,
          updated_at: new Date("2022-08-28"),
        },
        {
          user_id: "proctest1",
          name: "Procurement Dummy 1",
          password:
            "$2a$04$3d1O745ShmWJJabf8X54XuSbP7oBjdmlghUuKpRi5cPf.MUqGtK66",
          password_changed_at: new Date("2021-08-02"),
          last_used_password:
            '["$2a$04$3d1O745ShmWJJabf8X54XuSbP7oBjdmlghUuKpRi5cPf.MUqGtK66"]',
          email: "devinpangestu2000@gmail.com",
          role_id: 4,
          oracle_username: "X2X.UPCH1",
          created_at: new Date("2021-08-02"),
          created_by_id: 1,
          updated_at: new Date("2022-08-28"),
        },
        {
          user_id: "proctest2",
          name: "Procurement Dummy 2",
          password:
            "$2a$04$3d1O745ShmWJJabf8X54XuSbP7oBjdmlghUuKpRi5cPf.MUqGtK66",
          password_changed_at: new Date("2021-08-02"),
          last_used_password:
            '["$2a$04$3d1O745ShmWJJabf8X54XuSbP7oBjdmlghUuKpRi5cPf.MUqGtK66"]',
          email: "devinpangestu1980@gmail.com",
          role_id: 4,
          oracle_username: "X2X.UPCH3",
          created_at: new Date("2021-08-02"),
          created_by_id: 1,
          updated_at: new Date("2022-08-28"),
        },
        {
          user_id: "proctest3",
          name: "Procurement Dummy 3",
          password:
            "$2a$04$3d1O745ShmWJJabf8X54XuSbP7oBjdmlghUuKpRi5cPf.MUqGtK66",
          password_changed_at: new Date("2021-08-02"),
          last_used_password:
            '["$2a$04$3d1O745ShmWJJabf8X54XuSbP7oBjdmlghUuKpRi5cPf.MUqGtK66"]',
          email: "devinpangestu1980@gmail.com",
          role_id: 4,
          oracle_username: "X2X.SPCH2",
          created_at: new Date("2021-08-02"),
          created_by_id: 1,
          updated_at: new Date("2022-08-28"),
        },
        {
          user_id: "proctest4",
          name: "Procurement Dummy 4",
          password:
            "$2a$04$3d1O745ShmWJJabf8X54XuSbP7oBjdmlghUuKpRi5cPf.MUqGtK66",
          password_changed_at: new Date("2021-08-02"),
          last_used_password:
            '["$2a$04$3d1O745ShmWJJabf8X54XuSbP7oBjdmlghUuKpRi5cPf.MUqGtK66"]',
          email: "devinpangestu2000@gmail.com",
          role_id: 4,
          oracle_username: "X2X.SPCH3",
          created_at: new Date("2021-08-02"),
          created_by_id: 1,
          updated_at: new Date("2022-08-28"),
        },
        {
          user_id: "proctest5",
          name: "Procurement Dummy 5",
          password:
            "$2a$04$3d1O745ShmWJJabf8X54XuSbP7oBjdmlghUuKpRi5cPf.MUqGtK66",
          password_changed_at: new Date("2021-08-02"),
          last_used_password:
            '["$2a$04$3d1O745ShmWJJabf8X54XuSbP7oBjdmlghUuKpRi5cPf.MUqGtK66"]',
          email: "devinpangestu2000@gmail.com",
          role_id: 4,
          oracle_username: "X2X.SPCH4",
          created_at: new Date("2021-08-02"),
          created_by_id: 1,
          updated_at: new Date("2022-08-28"),
        },
        {
          user_id: "suptest1",
          name: "Supplier Dummy",
          password:
            "$2a$04$3d1O745ShmWJJabf8X54XuSbP7oBjdmlghUuKpRi5cPf.MUqGtK66",
          password_changed_at: new Date("2021-08-02"),
          last_used_password:
            '["$2a$04$3d1O745ShmWJJabf8X54XuSbP7oBjdmlghUuKpRi5cPf.MUqGtK66"]',
          email: "devinpangestu2000@gmail.com",
          role_id: 5,
          supplier_id: 624,
          created_at: new Date("2021-08-02"),
          created_by_id: 1,
          updated_at: new Date("2022-08-28"),
        },
        {
          user_id: "suptest2",
          name: "Supplier Dummy HENGLI",
          password:
            "$2a$04$3d1O745ShmWJJabf8X54XuSbP7oBjdmlghUuKpRi5cPf.MUqGtK66",
          password_changed_at: new Date("2021-08-02"),
          last_used_password:
            '["$2a$04$3d1O745ShmWJJabf8X54XuSbP7oBjdmlghUuKpRi5cPf.MUqGtK66"]',
          email: "devinpangestu2000@gmail.com",
          role_id: 5,
          supplier_id: 372068,
          created_at: new Date("2021-08-02"),
          created_by_id: 1,
          updated_at: new Date("2022-08-28"),
        },
        {
          user_id: "suptest3",
          name: "Supplier Dummy MitraPlast",
          password:
            "$2a$04$3d1O745ShmWJJabf8X54XuSbP7oBjdmlghUuKpRi5cPf.MUqGtK66",
          password_changed_at: new Date("2021-08-02"),
          last_used_password:
            '["$2a$04$3d1O745ShmWJJabf8X54XuSbP7oBjdmlghUuKpRi5cPf.MUqGtK66"]',
          email: "devinpangestu2000@gmail.com",
          role_id: 5,
          supplier_id: 752,
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
