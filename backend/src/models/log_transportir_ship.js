"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class LOG_TRANSPORTIR_SHIP extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.LOG_TRANSPORTIRS, {
        foreignKey: "transportir_id",
      });
      this.belongsTo(models.USERS, {
        foreignKey: "created_by_id",
        as: "crtd_by",
      });
      // this.hasMany(models.LOG_OFFERS, {
      //   foreignKey: "ship_id",
      // });
    }
  }
  LOG_TRANSPORTIR_SHIP.init(
    {
      capacity: {
        defaultValue: null,
        type: DataTypes.FLOAT,
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
      ship_id: {
        defaultValue: null,
        type: DataTypes.STRING,
      },
      transportir_id: {
        defaultValue: null,
        type: DataTypes.INTEGER.UNSIGNED,
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
      modelName: "LOG_TRANSPORTIR_SHIP",

      freezeTableName: true,
      timestamps: false,

      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    }
  );
  return LOG_TRANSPORTIR_SHIP;
};
