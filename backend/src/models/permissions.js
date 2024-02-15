"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class PERMISSIONS extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.PERMISSIONS_GROUP, {
        foreignKey: "group_id",
      });
    }
  }
  PERMISSIONS.init(
    {
      group_id: {
        allowNull: false,
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
      order_: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "PERMISSIONS",
      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    }
  );
  return PERMISSIONS;
};
