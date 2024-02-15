"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class MASTER_COMMODITY extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //// ADVANCE MANY TO MANY ////
      this.belongsToMany(models.m_whs, {
        through: models.whs_cmdts,
        foreignKey: "master_commodity_id",
        as: "whss",
      });
      this.hasMany(models.whs_cmdts, {
        foreignKey: "master_commodity_id",
        as: "mcmdtyid",
      });
      //// ADVANCE MANY TO MANY ////

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
  MASTER_COMMODITY.init(
    {
      commodity_id: {
        allowNull: false,
        type: DataTypes.STRING,
      },
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
    },
    {
      sequelize,
      modelName: "m_cmdty",
      tableName: "MASTER_COMMODITY",
      freezeTableName: true,
      timestamps: false,

      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    }
  );
  return MASTER_COMMODITY;
};
