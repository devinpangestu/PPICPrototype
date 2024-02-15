"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class po_headers_all extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.po_lines_all, {
        foreignKey: "PO_HEADER_ID",
      });
      this.hasMany(models.po_line_locations_all, {
        foreignKey: "PO_HEADER_ID",
      });
      this.hasMany(models.po_releases_all, {
        foreignKey: "PO_HEADER_ID",
      });
      this.hasMany(models.rcv_shipment_lines,{
        foreignKey: "PO_HEADER_ID",
      })
    }
  }
  po_headers_all.init(
    {
      PO_HEADER_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      SEGMENT1: {
        type: DataTypes.STRING,
        defaultValue: null,
      },
    },
    {
      sequelize,
      modelName: "po_headers_all",
      tableName: "PO_HEADERS_ALL",
      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_ORACLEDB_MASTERPOSCHEMA,
    }
  );
  return po_headers_all;
};
