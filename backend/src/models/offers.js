"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class OFFERS extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // this.belongsTo(models.SUPPLIERS, {
      //   foreignKey: "supplier_id",
      //   references: {
      //     model: models.SUPPLIERS,
      //     key: "id",
      //   },
      //   as: "spplr",
      // });

      this.belongsTo(models.USERS, {
        foreignKey: "created_by_id",
        as: "crtd_by",
      });
      this.belongsTo(models.USERS, {
        foreignKey: "updated_by_id",
        as: "updtd_by",
      });
      this.belongsTo(models.USERS, {
        foreignKey: "buyer_id",
      });
      this.hasOne(models.SUPPLIERS, {
        foreignKey: {
          name: "ref_id",
        },
        as: "supplier",
        sourceKey: "supplier_id",
      });
    }
  }
  OFFERS.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.NUMERIC,
      },

      submission_date: {
        defaultValue: DataTypes.NOW,
        type: DataTypes.DATE,
      },
      supplier_id: {
        allowNull: false,
        type: DataTypes.NUMERIC,
        references: {
          model: "SUPPLIERS",
          key: "ref_id",
        },
      },
      po_number: {
        defaultValue: null,
        type: DataTypes.STRING,
      },
      line_num: {
        defaultValue: null,
        type: DataTypes.NUMERIC,
        validate: {
          isInt: true,
        },
      },
      po_qty: {
        defaultValue: null,
        type: DataTypes.NUMERIC,
        validate: {
          isInt: true,
        },
      },
      po_outs: {
        // allowNull: false,
        defaultValue: null,
        type: DataTypes.NUMERIC,
        validate: {
          isInt: true,
        },
      },
      sku_code: {
        allowNull: false,
        defaultValue: null,
        type: DataTypes.STRING,
      },
      sku_name: {
        allowNull: false,
        defaultValue: null,
        type: DataTypes.STRING,
      },
      qty_delivery: {
        allowNull: false,
        defaultValue: null,
        type: DataTypes.NUMERIC,
        validate: {
          isInt: true,
        },
      },
      est_delivery: {
        defaultValue: DataTypes.NOW,
        type: DataTypes.DATE,
      },

      revised_qty: { defaultValue: null, type: DataTypes.NUMERIC },
      est_revised_date: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      submitted_qty: {
        defaultValue: null,
        type: DataTypes.NUMERIC,
        validate: {
          isInt: true,
        },
      },
      est_submitted_date: { defaultValue: null, type: DataTypes.DATE },
      gr_qty: {
        defaultValue: null,
        type: DataTypes.NUMERIC,
        validate: {
          isInt: true,
        },
      },
      flag_status: { defaultValue: "A", type: DataTypes.STRING },
      buyer_id: { defaultValue: null, type: DataTypes.NUMERIC },
      notes: { defaultValue: null, type: DataTypes.TEXT },
      edit_from_id: { defaultValue: null, type: DataTypes.NUMERIC },
      is_edit: { defaultValue: false, type: DataTypes.BOOLEAN },
      split_from_id: { defaultValue: null, type: DataTypes.NUMERIC },
      is_split: { defaultValue: false, type: DataTypes.BOOLEAN },
      created_by_id: {
        defaultValue: null,
        type: DataTypes.NUMERIC,
      },
      created_at: { defaultValue: null, type: DataTypes.DATE },
      updated_by_id: { defaultValue: null, type: DataTypes.NUMERIC },
      updated_at: { defaultValue: null, type: DataTypes.DATE },
      deleted_by_id: { defaultValue: null, type: DataTypes.NUMERIC },
      deleted_at: { defaultValue: null, type: DataTypes.DATE },
    },
    {
      sequelize,
      tableName: "offers",
      modelName: "OFFERS",
      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    }
  );
  return OFFERS;
};
