"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class PRICE_MDEX_INFO extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.USERS, {
        foreignKey: "created_by_id",
        as: "crtd_by",
      });
    }
  }
  PRICE_MDEX_INFO.init(
    {
      additional_cost: {
        defaultValue: null,
        type: DataTypes.FLOAT,
      },
      bk: {
        defaultValue: null,
        type: DataTypes.FLOAT,
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
      deleted_at: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      deleted_by_id: {
        defaultValue: null,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      government_fee: {
        defaultValue: null,
        type: DataTypes.FLOAT,
      },
      levy: {
        defaultValue: null,
        type: DataTypes.FLOAT,
      },
      ny_crude_oil: {
        allowNull: false,
        type: DataTypes.FLOAT,
      },
      type: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.STRING,
      },
      updated_at: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      updated_by_id: {
        defaultValue: null,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      usd_to_idr_reuters: {
        allowNull: false,
        type: DataTypes.FLOAT,
      },
      usd_to_idr_telequote: {
        allowNull: false,
        type: DataTypes.FLOAT,
      },
      usd_to_myr: {
        allowNull: false,
        type: DataTypes.FLOAT,
      },
    },
    {
      sequelize,
      modelName: "PRICE_MDEX_INFO",
      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    }
  );
  return PRICE_MDEX_INFO;
};
