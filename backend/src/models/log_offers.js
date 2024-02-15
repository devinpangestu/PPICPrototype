"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class LOG_OFFERS extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      
      this.belongsTo(models.LOG_TRANSPORTIR_SHIP, {
        foreignKey: "ship_id",
        as: "ship",
      });
      this.belongsTo(models.LOG_TRANSPORTIRS, {
        foreignKey: "transportir_id",
        as: "trnsprtr",
      });
      this.belongsTo(models.MASTER_ROUTE_LOCATION, {
        foreignKey: "discharge_route_id",
        references: {
          model: models.MASTER_ROUTE_LOCATION,
          key: "id",
        },
        as: "dRoute",
      });
      this.belongsTo(models.MASTER_ROUTE_LOCATION, {
        foreignKey: "ship_route_id",
        references: {
          model: models.MASTER_ROUTE_LOCATION,
          key: "id",
        },
        as: "sRoute",
      });
      this.hasMany(models.FILES, {
        foreignKey: "unique_id",
        as: "fls",
      });
    }
  }
  LOG_OFFERS.init(
    {
      actual_loading_date: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      actual_loading_updated_at: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      actual_loading_updated_by: {
        defaultValue: null,
        type: DataTypes.INTEGER,
      },
      additional_cost: {
        defaultValue: null,
        type: DataTypes.FLOAT,
      },
      adjust_comment: {
        type: DataTypes.TEXT,
      },
      approve_comment: {
        type: DataTypes.TEXT,
      },
      br_quantity: {
        defaultValue: null,
        type: DataTypes.FLOAT,
      },
      br_date: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      budget: {
        defaultValue: null,
        type: DataTypes.FLOAT,
      },
      commodity_offer_id: {
        defaultValue: null,
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
      deleted_at: {
        type: DataTypes.DATE,
      },
      deleted_by_id: {
        type: DataTypes.INTEGER.UNSIGNED,
      },
      delivered_date: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      delivered_updated_at: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      delivered_updated_by: {
        defaultValue: null,
        type: DataTypes.INTEGER,
      },
      delivery_date: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      delivery_updated_at: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      delivery_updated_by: {
        defaultValue: null,
        type: DataTypes.INTEGER,
      },
      discharge_route_id: {
        defaultValue: null,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      discharged_date: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      discharged_updated_at: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      discharged_updated_by: {
        defaultValue: null,
        type: DataTypes.INTEGER,
      },
      eta_from: {
        type: DataTypes.DATE,
      },
      eta_to: {
        type: DataTypes.DATE,
      },
      final_qffa: {
        defaultValue: null,
        type: DataTypes.FLOAT,
      },
      final_qmi: {
        defaultValue: null,
        type: DataTypes.FLOAT,
      },
      final_qdobi: {
        defaultValue: null,
        type: DataTypes.FLOAT,
      },
      final_qtotox: {
        defaultValue: null,
        type: DataTypes.FLOAT,
      },
      final_qiv: {
        defaultValue: null,
        type: DataTypes.FLOAT,
      },
      finalhoverqffa: {
        defaultValue: null,
        type: DataTypes.FLOAT,
      },
      finalhoverqmi: {
        defaultValue: null,
        type: DataTypes.FLOAT,
      },
      finalhoverqdobi: {
        defaultValue: null,
        type: DataTypes.FLOAT,
      },
      finalhoverqtotox: {
        defaultValue: null,
        type: DataTypes.FLOAT,
      },
      finalhoverqiv: {
        defaultValue: null,
        type: DataTypes.FLOAT,
      },
      gr_quantity: {
        defaultValue: null,
        type: DataTypes.FLOAT,
      },
      gr_number: { defaultValue: null, type: DataTypes.TEXT },
      gr_lock: {
        defaultValue: null,
        type: DataTypes.BOOLEAN,
      },
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      loading_date_from: {
        type: DataTypes.DATE,
      },
      loading_date_to: {
        type: DataTypes.DATE,
      },
      logistic_offer_id: {
        defaultValue: null,
        type: DataTypes.STRING,
      },
      logistic_transaction_id: {
        defaultValue: null,
        type: DataTypes.STRING,
      },
      po_number: {
        defaultValue: null,
        type: DataTypes.STRING,
      },
      price: {
        allowNull: false,
        type: DataTypes.FLOAT,
      },
      qty_bast: {
        defaultValue: null,
        type: DataTypes.FLOAT,
      },
      quantity: {
        allowNull: false,
        type: DataTypes.FLOAT,
      },
      quantity_bl: {
        defaultValue: null,
        type: DataTypes.FLOAT,
      },

      reject_comment: {
        type: DataTypes.TEXT,
      },
      release_num: {
        defaultValue: null,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      ship_id: {
        defaultValue: null,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      ship_route_id: {
        defaultValue: null,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      status: {
        defaultValue: "pending_approval",
        allowNull: false,
        type: DataTypes.STRING,
      },
      transportir_id: {
        allowNull: false,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      type: {
        defaultValue: null,
        type: DataTypes.STRING,
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
      modelName: "LOG_OFFERS",

      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    }
  );
  return LOG_OFFERS;
};
