"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes)=> {
  class bpapo_lines_all extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.bpapo_headers_all, {
        foreignKey: "BPA_HEADER_ID",
      });
    }
  }
  bpapo_lines_all.init(
    {
      BPA_HEADER_ID: {
        type: DataTypes.STRING,
        defaultValue: false,
      },
      BPA_LINE_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      sequelize,
      modelName: "bpapo_lines_all",
      tableName: "BPAPO_LINES_ALL",
      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_ORACLEDB_MASTERSCHEMA,
    }
  );
  return bpapo_lines_all;
};
