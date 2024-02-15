"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class REPORTS extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  REPORTS.init(
    {
      created_at: {
        defaultValue: DataTypes.NOW,
        allowNull: false,
        type: DataTypes.DATE,
      },
      created_by_id: {
        defaultValue: 1,
        allowNull: false,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      offer_id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.STRING,
      },
      type: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.STRING,
      },
      url: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: "REPORTS",
      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    }
  );
  return REPORTS;
};
