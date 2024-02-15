"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class suppliers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.USERS, {
        foreignKey: "supplier_id",
        as: "from_supplier",
        sourceKey: "ref_id",
      });
      this.belongsTo(models.OFFERS, {
        foreignKey: "ref_id",
        as: "supplier",
        targetKey: "supplier_id",
      });
    }
  }
  suppliers.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.NUMERIC,
      },
      ref_id: {
        foreignKey: true,
        allowNull: false,
        type: DataTypes.NUMERIC,
        references: {
          model: "USERS",
          key: "supplier_id",
        },
        references: {
          model: "OFFERS",
          key: "supplier_id",
        },
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      email: { defaultValue: null, type: DataTypes.TEXT },
      user_status: { defaultValue: false, type: DataTypes.BOOLEAN },
      verified_status: { defaultValue: false, type: DataTypes.BOOLEAN },
      supplier_number: { defaultValue: null, type: DataTypes.STRING },
      vendor_site_code: { defaultValue: null, type: DataTypes.STRING },
      created_at: {
        allowNull: true,
        defaultValue: DataTypes.NOW,
        type: DataTypes.DATE,
      },
      created_by_id: {
        allowNull: true,
        defaultValue: 1,
        type: DataTypes.NUMERIC,
      },
      updated_at: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      updated_by_id: {
        defaultValue: null,
        type: DataTypes.NUMERIC,
      },
      deleted_at: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      deleted_by_id: {
        defaultValue: null,
        type: DataTypes.NUMERIC,
      },
    },
    {
      sequelize,
      tableName: "suppliers",
      modelName: "SUPPLIERS",
      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    }
  );
  return suppliers;
};
