"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class CHATS extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CHATS.init(
    {
      id: {
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER.UNSIGNED,
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
      datetime: {
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

      message: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      room_id: {
        allowNull: false,
        type: DataTypes.INTEGER.UNSIGNED,
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
      modelName: "CHATS",

      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    }
  );
  return CHATS;
};
