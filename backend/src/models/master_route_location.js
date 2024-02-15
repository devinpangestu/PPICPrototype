"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class MASTER_ROUTE_LOCATION extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      this.belongsTo(models.USERS, {
        foreignKey: "created_by_id",
        references: {
          model: models.USERS,
          key: "id",
        },
        as: "crtd_by",
      });

      this.belongsTo(models.mhOverLoc, {
        foreignKey: "handover_location_id",
        references: {
          model: models.mhOverLoc,
          key: "id",
        },
        as: "hOver_loc",
      });
      this.belongsTo(models.mhOverLoc, {
        foreignKey: "destination_location_id",
        references: {
          model: models.mhOverLoc,
          key: "id",
        },
        as: "dstn_loc",
      });
      this.hasMany(models.LOG_OFFERS, {
        foreignKey: "ship_route_id",
        as: "sRoute",
      });
      this.hasMany(models.LOG_OFFERS, {
        foreignKey: "discharge_route_id",
        as: "dRoute",
      });
    }
  }
  MASTER_ROUTE_LOCATION.init(
    {
      budget: {
        defaultValue: null,
        type: DataTypes.STRING,
      },
      handover_location_id: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      destination_location_id: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      types: { defaultValue: null, type: DataTypes.STRING },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      created_by_id: {
        allowNull: false,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updated_by_id: {
        defaultValue: null,
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
    },
    {
      sequelize,
      modelName: "MASTER_ROUTE_LOCATION",
      freezeTableName: true,
      timestamps: false,

      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    }
  );
  return MASTER_ROUTE_LOCATION;
};
