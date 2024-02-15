"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class MASTER_HANDOVER_LOCATION extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      ////MANY TO MANY WAREHOUSE TO HANDOVER LOCATION////
      this.belongsToMany(models.m_whs, {
        through: models.MASTER_BUDGET_TRANSPORTIR,
        foreignKey: "handover_location_id",
      });
      this.hasMany(models.MASTER_BUDGET_TRANSPORTIR, {
        foreignKey: "handover_location_id",
      });
      ////MANY TO MANY COMMODITY TO HANDOVER LOCATION////

      this.belongsTo(models.USERS, {
        foreignKey: "created_by_id",
        references: {
          model: models.USERS,
          key: "id",
        },
        as: "crtd_by",
      });

      

      this.hasMany(models.MASTER_ROUTE_LOCATION, {
        foreignKey: "handover_location_id",
      });
      this.hasMany(models.MASTER_ROUTE_LOCATION, {
        foreignKey: "destination_location_id",
      });
    }
  }

  MASTER_HANDOVER_LOCATION.init(
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
      location_id: {
        allowNull: false,
        type: DataTypes.STRING,
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
    },
    {
      sequelize,
      modelName: "mhOverLoc",
      tableName: "MASTER_HANDOVER_LOCATION",
      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    }
  );

  return MASTER_HANDOVER_LOCATION;
};
