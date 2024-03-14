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
      id: {
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        type: DataTypes.NUMERIC,
      },
      offer_id: {
        allowNull: false,
        type: DataTypes.NUMERIC,
      },
      master_log_type: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      log_detail: { allowNull: false, type: DataTypes.TEXT },
      log_timestamp: {
        defaultValue: DataTypes.NOW,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      tableName: "log_transactions",
      modelName: "LOG_TRANSACTIONS",
      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    }
  );
  return LOG_TRANSACTIONS;
};
