"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class LOG_TRANSACTIONS extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  LOG_TRANSACTIONS.init(
    {
      datetime: {
        allowNull: false,
        defaultValue: DataTypes.NOW,
        type: DataTypes.DATE,
      },
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING,
      },
      is_on_time: {
        defaultValue: null,
        type: DataTypes.BOOLEAN,
      },
    },
    {
      sequelize,
      modelName: "LOG_TRANSACTIONS",

      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    }
  );
  return LOG_TRANSACTIONS;
};
