"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class bpapo_headers_all extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.bpapo_lines_all, {
        foreignKey: "BPA_HEADER_ID",
      });
      this.hasOne(models.po_headers_all),{
        foreignKey: "SEGMENT1",
      }
    }
  }
  bpapo_headers_all.init(
    {
      BPA_HEADER_ID: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      PO_NUM: {
        type: DataTypes.STRING,
        defaultValue: null,
      },
    },
    {
      sequelize,
      modelName: "bpapo_headers_all",
      tableName: "BPAPO_HEADERS_ALL",
      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_ORACLEDB_MASTERSCHEMA,
    }
  );
  return bpapo_headers_all;
};
