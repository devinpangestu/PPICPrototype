"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class LOG_SPK extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
     
      // define association here
    }
  }
  LOG_SPK.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      logistic_spk_id: {
        defaultValue: null,
        type: DataTypes.STRING,
      },
      type: {
        defaultValue: null,
        type: DataTypes.STRING,
      },
      commodity_offer_id: {
        allowNull: false,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      logistic_offer_id: {
        allowNull: false,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      spk_number: {
        defaultValue: null,
        type: DataTypes.STRING,
      },
      loading_date_target: {
        defaultValue: null,
        type: DataTypes.INTEGER,
      },
      notes: {
        type: DataTypes.TEXT,
      },
      contract_numbers: {
        defaultValue: null,
        type: DataTypes.TEXT,
      },
      agen_kapal: {
        defaultValue: null,
        type: DataTypes.STRING,
      },
      petugas: {
        defaultValue: null,
        type: DataTypes.STRING,
      },
      port: {
        defaultValue: null,
        type: DataTypes.STRING,
      },
      unloading_date_start: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      unloading_date_end: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      pdf_path: {
        defaultValue: null,
        type: DataTypes.STRING,
      },
      created_at: {
        defaultValue: DataTypes.NOW,
        allowNull: false,
        type: DataTypes.DATE(6),
      },
      created_by_id: {
        defaultValue: 1,
        allowNull: false,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      updated_at: {
        defaultValue: null,
        type: DataTypes.DATE(6),
      },
      updated_by_id: {
        defaultValue: null,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      deleted_at: {
        defaultValue: null,
        type: DataTypes.DATE(6),
      },
      deleted_by_id: {
        defaultValue: null,
        type: DataTypes.INTEGER.UNSIGNED,
      },
    },
    {
      sequelize,
      modelName: "LOG_SPK",

      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    }
  );
  return LOG_SPK;
};
