"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class AP_SUPPLIERS extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      
    }
  }
  AP_SUPPLIERS.init(
    {
      
    },
    {
      sequelize,
      modelName: "AP_SUPPLIERS",
      tableName: "AP_SUPPLIERS",
      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_ORACLEDB_MASTERSCHEMA,
    }
  );
  return AP_SUPPLIERS;
};
