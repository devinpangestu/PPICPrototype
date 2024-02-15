"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class ROLES extends Model {
    export;
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      this.hasMany(models.USERS, {
        foreignKey: "role_id",
      });
    }
  }
  ROLES.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.NUMERIC,
      },
      permissions: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      desc_: {
        type: DataTypes.TEXT,
      },

      super_user: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      // created_at: {
      //   defaultValue: DataTypes.NOW,
      //   allowNull: false,
      //   type: DataTypes.DATE(6),
      // },
      // created_by: {
      //   defaultValue: 1,
      //   allowNull: false,
      //   type: DataTypes.NUMERIC,
      // },
      // updated_at: {
      //   defaultValue: null,
      //   type: DataTypes.DATE(6),
      // },
      // updated_by: {
      //   defaultValue: null,
      //   type: DataTypes.INTEGER,
      // },
      // deleted_at: {
      //   defaultValue: null,
      //   type: DataTypes.DATE(6),
      // },
      // deleted_by: {
      //   defaultValue: null,
      //   type: DataTypes.INTEGER,
      // },
    },
    {
      sequelize,
      tableName: "roles",
      modelName: "ROLES",
      schema: process.env.NODE_MSSQL_MAINSCHEMA,
      freezeTableName: true,
      timestamps: false,
      raw: true,
    }
  );
  return ROLES;
};

