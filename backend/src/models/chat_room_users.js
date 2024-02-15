"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class CHAT_ROOM_USERS extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CHAT_ROOM_USERS.init(
    {
      chat_room_id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      user_id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.INTEGER.UNSIGNED,
      },
    },
    {
      sequelize,

      modelName: "CHAT_ROOM_USERS",
      freezeTableName: true,
      timestamps: false,
      paranoid: true,
      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    }
  );
  return CHAT_ROOM_USERS;
};
