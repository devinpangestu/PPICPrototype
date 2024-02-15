"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class FILES extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.LOG_OFFERS, {
        foreignKey: "unique_id",
        as: "fls",
        references: {
          model: models.LOG_OFFERS,
          key: "logistic_offer_id",
        },
      });
    }
  }
  FILES.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER.UNSIGNED,
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

      storage_path: {
        type: DataTypes.TEXT,
      },
      type: {
        defaultValue: null,
        type: DataTypes.STRING,
      },
      uid_: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      unique_id: {
        defaultValue: null,
        type: DataTypes.STRING,
      },
      url: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: "FILES",

      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    }
  );
  return FILES;
};
