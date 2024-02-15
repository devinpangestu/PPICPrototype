"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class po_lines_all extends Model {
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
      this.hasMany(models.po_line_locations_all, {
        foreignKey: "PO_LINE_ID",
      });
    }
  }
  po_lines_all.init(
    {
      PO_LINE_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      PO_HEADER_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      QUANTITY_COMMITTED: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "po_lines_all",
      tableName: "PO_LINES_ALL",
      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_ORACLEDB_MASTERPOSCHEMA,
    }
  );
  return po_lines_all;
};
