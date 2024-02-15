"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class purchasing extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.rcv_shipment_lines, {
        foreignKey: "SHIPMENT_HEADER_ID",
      });
    }
  }
  purchasing.init(
    {
      SHIPMENT_HEADER_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      RECEIPT_NUM: {
        type: DataTypes.STRING,
        defaultValue: null,
      },
    },
    {
      sequelize,
      modelName: "purchasing",
      tableName: "PURCHASING",
      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    }
  );
  return purchasing;
};
