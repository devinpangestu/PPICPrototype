"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class MASTER_CONFIG extends Model {
    export;
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
    }
  }
  MASTER_CONFIG.init(
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
      data_type: {
        allowNull: false,
        type: DataTypes.STRING,
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
      value: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: "MASTER_CONFIG",

      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    }
  );
  return MASTER_CONFIG;
};
