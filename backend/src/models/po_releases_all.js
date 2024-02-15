"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class po_releases_all extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.po_line_locations_all, {
        foreignKey: "PO_RELEASE_ID",
      });
      this.belongsTo(models.po_headers_all, {
        foreignKey: "PO_HEADER_ID",
      });
    }
  }
  po_releases_all.init(
    {
      PO_RELEASE_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      PO_HEADER_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      RELEASE_NUM: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      RELEASE_DATE: {
        type: DataTypes.DATE,
        defaultValue: null,
      },
    },
    {
      sequelize,
      modelName: "po_releases_all",
      tableName: "PO_RELEASES_ALL",
      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_ORACLEDB_MASTERPOSCHEMA,
    }
  );
  return po_releases_all;
};
