"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class PRICE_REUTERS extends Model {
    export;
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
  PRICE_REUTERS.init(
    {
      additional_cost: {
        defaultValue: null,
        type: DataTypes.FLOAT,
      },
      bk: {
        defaultValue: null,
        type: DataTypes.FLOAT,
      },
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
      deleted_at: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      deleted_by_id: {
        defaultValue: null,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      freight: {
        defaultValue: null,
        type: DataTypes.FLOAT,
      },
      government_fee: {
        defaultValue: null,
        type: DataTypes.FLOAT,
      },
      levy: {
        defaultValue: null,
        type: DataTypes.FLOAT,
      },
      month_index: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      price: {
        allowNull: false,
        type: DataTypes.FLOAT,
      },
      price_idr_final: {
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
    },
    {
      sequelize,
      modelName: "PRICE_REUTERS",
      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    }
  );
  return PRICE_REUTERS;
};
