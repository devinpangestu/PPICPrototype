"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class rcv_shipment_lines extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasOne(models.rcv_shipment_headers, {
        foreignKey: "SHIPMENT_HEADER_ID",
      });
      this.belongsTo(models.po_headers_all, {
        foreignKey: "PO_HEADER_ID",
      });
    }
  }
  rcv_shipment_lines.init(
    {
      SHIPMENT_LINE_ID: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      SHIPMENT_HEADER_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      QUANTITY_RECEIVED: {
        type: DataTypes.FLOAT,
        defaultValue: null,
      },
      PO_HEADER_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      PO_RELEASE_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "rcv_shipment_lines",
      tableName: "RCV_SHIPMENT_LINES",
      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_ORACLEDB_MASTERPOSCHEMA,
    }
  );
  return rcv_shipment_lines;
};
