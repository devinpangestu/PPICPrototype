"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class PRICE_DALIAN extends Model {
    export;
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PRICE_DALIAN.init(
    {
      commodity: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.STRING,
      },
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
      date_: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.DATE,
      },
      month_index: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      price_rmb: {
        allowNull: false,
        type: DataTypes.FLOAT,
      },
      price_rmb_progressive: {
        allowNull: false,
        type: DataTypes.FLOAT,
      },
      price_usd: {
        allowNull: false,
        type: DataTypes.FLOAT,
      },
      updated_at: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      updated_by_id: {
        defaultValue: null,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      usd_to_rmb: {
        allowNull: false,
        type: DataTypes.FLOAT,
      },
    },
    {
      sequelize,
      modelName: "PRICE_DALIAN",
      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    }
  );
  return PRICE_DALIAN;
};
