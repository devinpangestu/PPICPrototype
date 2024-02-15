"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class MASTER_WAREHOUSE extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ////MANY TO MANY WAREHOUSE TO HANDOVER LOCATION////
      this.belongsToMany(models.mhOverLoc, {
        through: models.MASTER_BUDGET_TRANSPORTIR,
        foreignKey: "warehouse_id",
      });
      this.hasMany(models.MASTER_BUDGET_TRANSPORTIR, {
        foreignKey: "warehouse_id",
      });
      ////MANY TO MANY WAREHOUSE TO HANDOVER LOCATION////

      //// MANY TO MANY COMMODITY TO WAREHOUSE////
      this.belongsToMany(models.m_cmdty, {
        through: models.whs_cmdts,
        foreignKey: "master_warehouse_id",
        as: "cmdts",
      });

      this.hasMany(models.whs_cmdts, {
        foreignKey: "master_warehouse_id",
        as: "mwhssid",
      });
      //// MANY TO MANY COMMODITY TO WAREHOUSE////

      this.belongsTo(models.USERS, {
        foreignKey: "created_by_id",
        references: {
          model: models.USERS,
          key: "id",
        },
        as: "crtd_by",
      });

      //offers
    
    }
  }
  MASTER_WAREHOUSE.init(
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
      deleted_at: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      deleted_by_id: {
        defaultValue: null,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      updated_at: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      updated_by_id: {
        defaultValue: null,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      warehouse_id: {
        allowNull: false,
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "m_whs",
      tableName: "MASTER_WAREHOUSE",
      freezeTableName: true,
      timestamps: false,

      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    }
  );
  return MASTER_WAREHOUSE;
};
