"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class TRANSACTIONS extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
     
    }
  }
  TRANSACTIONS.init(
    {
      datetime: {
        defaultValue: DataTypes.NOW,
        allowNull: false,
        type: DataTypes.DATE,
      },
      delivered_datetime: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      handover_date: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.STRING,
      },
      is_otif: {
        defaultValue: null,
        type: DataTypes.BOOLEAN,
      },
      br_fulfilled: {
        defaultValue: null,
        type: DataTypes.BOOLEAN,
      },
      gr_fulfilled: {
        defaultValue: null,
        type: DataTypes.BOOLEAN,
      },
      documents_fulfilled: {
        defaultValue: null,
        type: DataTypes.BOOLEAN,
      },
      lTruck_fulfilled: {
        defaultValue: null,
        type: DataTypes.BOOLEAN,
      },
      ship_fulfilled: {
        defaultValue: null,
        type: DataTypes.BOOLEAN,
      },
      dTruck_fulfilled: {
        defaultValue: null,
        type: DataTypes.BOOLEAN,
      },
    },
    {
      sequelize,
      modelName: "trns",
      tableName: "TRANSACTIONS",
      freezeTableName: true,
      timestamps: false,

      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    }
  );
  return TRANSACTIONS;
};
