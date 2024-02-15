"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class AP_SUPPLIER_SITES_ALL extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
     
    }
  }
  AP_SUPPLIER_SITES_ALL.init(
    {
      
     
    },
    {
      sequelize,
      modelName: "AP_SUPPLIER_SITES_ALL",
      tableName: "AP_SUPPLIER_SITES_ALL",
      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_ORACLEDB_MASTERSCHEMA,
    }
  );
  return AP_SUPPLIER_SITES_ALL;
};
