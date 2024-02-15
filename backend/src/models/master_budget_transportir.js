"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class MASTER_BUDGET_TRANSPORTIR extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //// MANY TO MANY ////
      this.belongsTo(models.m_whs, {
        foreignKey: "warehouse_id",
        as: "whs",
      });
      this.belongsTo(models.mhOverLoc, {
        foreignKey: "handover_location_id",
        as: "hOver_loc",
      });

      //// MANY TO MANY ////

      this.belongsTo(models.USERS, {
        foreignKey: "created_by_id",
        references: {
          model: models.USERS,
          key: "id",
        },
        as: "crtd_by",
      });
    }
  }
  MASTER_BUDGET_TRANSPORTIR.init(
    {
      budget: {
        defaultValue: null,
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
      handover_location_id: {
        defaultValue: null,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      terms_of_handover: {
        defaultValue: null,
        type: DataTypes.STRING,
      },
      warehouse_id: {
        defaultValue: null,
        type: DataTypes.INTEGER.UNSIGNED,
      },
    },
    {
      sequelize,
      modelName: "MASTER_BUDGET_TRANSPORTIR",

      freezeTableName: true,
      timestamps: false,

      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    }
  );
  return MASTER_BUDGET_TRANSPORTIR;
};
