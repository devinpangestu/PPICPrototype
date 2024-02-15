"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class token extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  token.init(
    {
      expired_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.STRING,
      },
      issued_at: {
        defaultValue: DataTypes.NOW,
        allowNull: false,
        type: DataTypes.DATE,
      },
      logout_at: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      type: {
        defaultValue: "access",
        type: DataTypes.STRING,
      },
      token: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      user_id: {
        allowNull: false,
        type: DataTypes.INTEGER.UNSIGNED,
      },
    },
    {
      sequelize,
      tableName: "token",
      modelName: "TOKEN",
      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    }
  );
  return token;
};
