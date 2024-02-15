"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class WAREHOUSE_COMMODITIES extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //// ADVANCE MANY TO MANY ////

      this.belongsTo(models.m_cmdty, {
        foreignKey: "master_commodity_id",
        as: "cmdts",
      });
      this.belongsTo(models.m_whs, {
        foreignKey: "master_warehouse_id",
        as: "whss",
      });
      //// ADVANCE MANY TO MANY ////
    }
  }
  WAREHOUSE_COMMODITIES.init(
    {
      master_commodity_id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      master_warehouse_id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.INTEGER.UNSIGNED,
      },
    },
    {
      sequelize,
      modelName: "whs_cmdts",
      tableName: "WAREHOUSE_COMMODITIES",
      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    }
  );
  return WAREHOUSE_COMMODITIES;
};
