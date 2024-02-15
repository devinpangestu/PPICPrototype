"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class MASTER_CHANGELOG extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  MASTER_CHANGELOG.init(
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
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      master_id: {
        defaultValue: null,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      master_type: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      meta_data_from: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      meta_data_to: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: "MASTER_CHANGELOG",

      freezeTableName: true,
      timestamps: false,
      paranoid: true,
      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    }
  );
  return MASTER_CHANGELOG;
};
