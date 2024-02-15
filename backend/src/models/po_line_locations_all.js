"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class po_line_locations_all extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.po_headers_all, {
        foreignKey: "PO_HEADER_ID",
      });
      this.belongsTo(models.po_lines_all, {
        foreignKey: "PO_LINE_ID",
      });
      this.hasOne(models.po_releases_all, {
        foreignKey: "PO_RELEASE_ID",
        as: "PLA",
      });
    }
  }
  po_line_locations_all.init(
    {
      LINE_LOCATION_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      SHIPMENT_NUM: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      PO_LINE_ID: { type: DataTypes.INTEGER, allowNull: false },
      PO_HEADER_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      CANCEL_FLAG: {
        type: DataTypes.STRING,
        defaultValue: null,
      },
      QUANTITY:{
        type: DataTypes.INTEGER,
        defaultValue: null,
      },
      QUANTITY_RECEIVED: {
        type: DataTypes.INTEGER,
        defaultValue: null,
      },
      PO_RELEASE_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "po_line_locations_all",
      tableName: "PO_LINE_LOCATIONS_ALL",
      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_ORACLEDB_MASTERPOSCHEMA,
    }
  );
  return po_line_locations_all;
};
