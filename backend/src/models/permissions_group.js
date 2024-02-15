"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class PERMISSIONS_GROUP extends Model {
    export;
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.PERMISSIONS, {
        foreignKey: "group_id",
        as: "actions",
      });
    }
  }
  PERMISSIONS_GROUP.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      order_: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "PERMISSIONS_GROUP",

      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    }
  );
  return PERMISSIONS_GROUP;
};
