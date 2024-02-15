"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class rcv_shipment_headers extends Model {
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
  rcv_shipment_headers.init(
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
      modelName: "rcv_shipment_headers",
      tableName: "RCV_SHIPMENT_HEADERS",
      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_ORACLEDB_MASTERPOSCHEMA,
    }
  );
  return rcv_shipment_headers;
};
