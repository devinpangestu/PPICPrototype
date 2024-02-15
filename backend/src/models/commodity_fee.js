"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class COMMODITY_FEE extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.USERS, {
        foreignKey: "created_by_id",
        references: {
          model: models.USERS,
          key: "id",
        },
        as: "crtd_by",
      });
    }
  }
  COMMODITY_FEE.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING,
      },
      commodity: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING,
      },
      created_by_id: {
        defaultValue: 1,
        allowNull: false,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      fee_type: {
        defaultValue: null,
        type: DataTypes.STRING,
      },

      valid_from: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.DATE,
      },
      value: {
        allowNull: false,
        type: DataTypes.FLOAT,
      },
    },
    {
      sequelize,
      modelName: "COMMODITY_FEE",

      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    }
  );
  return COMMODITY_FEE;
};
