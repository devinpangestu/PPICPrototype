"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class LOG_TRANSPORTIRS extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.LOG_TRANSPORTIR_SHIP, {
        foreignKey: "transportir_id",
        references: {
          model: models.LOG_TRANSPORTIRS,
          key: "id",
        },
        as: "ships",
      });
      this.belongsTo(models.USERS, {
        foreignKey: "created_by_id",
        as: "crtd_by",
      });
      this.hasMany(models.LOG_OFFERS, {
        foreignKey: "transportir_id",
      });
    }
  }
  LOG_TRANSPORTIRS.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      transportir_id: {
        defaultValue: null,
        type: DataTypes.STRING,
      },
      types: {
        defaultValue: null,
        type: DataTypes.TEXT,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      created_at: {
        defaultValue: DataTypes.NOW,
        allowNull: false,
        type: DataTypes.DATE(6),
      },
      created_by_id: {
        defaultValue: 1,
        allowNull: false,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      updated_at: {
        defaultValue: null,
        type: DataTypes.DATE(6),
      },
      updated_by_id: {
        defaultValue: null,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      deleted_at: {
        defaultValue: null,
        type: DataTypes.DATE(6),
      },
      deleted_by_id: {
        defaultValue: null,
        type: DataTypes.INTEGER.UNSIGNED,
      },
    },
    {
      sequelize,
      modelName: "LOG_TRANSPORTIRS",

      freezeTableName: true,
      timestamps: false,

      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    }
  );
  return LOG_TRANSPORTIRS;
};
