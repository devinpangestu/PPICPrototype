"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class USERS extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasOne(models.mhOverLoc, {
        foreignKey: "created_by_id",
      });
      this.hasOne(models.m_whs, {
        foreignKey: "created_by_id",
      });
      this.hasOne(models.m_cmdty, {
        foreignKey: "created_by_id",
      });
      this.hasOne(models.MASTER_BUDGET_TRANSPORTIR, {
        foreignKey: "created_by_id",
      });
      this.hasOne(models.MASTER_CONFIG, {
        foreignKey: "created_by_id",
      });
      this.hasOne(models.COMMODITY_FEE, {
        foreignKey: "created_by_id",
      });
      this.hasOne(models.SUPPLIERS, {
        foreignKey: "created_by_id",
      });
      this.hasOne(models.PRICE_KPB, {
        foreignKey: "created_by_id",
      });
      this.hasOne(models.PRICE_MDEX, {
        foreignKey: "created_by_id",
      });
      this.hasOne(models.PRICE_MDEX_INFO, {
        foreignKey: "created_by_id",
      });
      this.hasOne(models.PRICE_MDEX_CBT, {
        foreignKey: "created_by_id",
      });
      this.hasOne(models.PRICE_REUTERS, {
        foreignKey: "created_by_id",
      });
      this.hasOne(models.PRICE_REUTERS_INFO, {
        foreignKey: "created_by_id",
      });
      this.hasOne(models.LOG_TRANSPORTIRS, {
        foreignKey: "created_by_id",
      });
      this.hasOne(models.LOG_TRANSPORTIR_SHIP, {
        foreignKey: "created_by_id",
      });
      // this.hasMany(models.OFFERS, {
      //   foreignKey: "created_by_id",
      // });
      // this.hasMany(models.OFFERS, {
      //   foreignKey: "updated_by_id",
      // });

      this.hasOne(models.MASTER_ROUTE_LOCATION, {
        foreignKey: "created_by_id",
      });
      this.belongsTo(models.SUPPLIERS, {
        foreignKey: {
          name: "supplier_id",
        },
        as: "from_supplier",
        targetKey: "ref_id",
      });

      // db.mhOverLoc.belongsTo(db.USERS, {
      //   foreignKey: "created_by_id",
      //   references: {
      //     model: db.USERS,
      //     key: "id",
      //   },
      //   as: "crtd_by",
      // });
      this.belongsTo(models.ROLES, {
        foreignKey: "role_id",
        references: {
          model: models.ROLES,
          key: "id",
        },
        as: "role",
      });
    }
  }

  USERS.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.NUMERIC,
      },
      user_id: {
        defaultValue: null,
        type: DataTypes.STRING,
      },
      name: {
        defaultValue: null,
        type: DataTypes.STRING,
      },
      password: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      email: {
        defaultValue: null,
        type: DataTypes.STRING,
      },
      role_id: {
        defaultValue: 3,
        allowNull: false,
        type: DataTypes.NUMERIC,
      },
      oracle_username: {
        defaultValue: null,
        type: DataTypes.STRING,
      },
      supplier_id: {
        defaultValue: null,
        type: DataTypes.NUMERIC,
        references: {
          model: "SUPPLIERS",
          key: "ref_id",
        },
      },
      failed_login_attempts: {
        defaultValue: 0,
        type: DataTypes.NUMERIC,
      },
      last_failed_login: { defaultValue: null, type: DataTypes.DATE(6) },
      password_changed_at: {
        defaultValue: null,
        type: DataTypes.DATE(6),
      },
      account_lock_timestamp: {
        defaultValue: null,
        type: DataTypes.DATE(6),
      },
      account_lock_count: {
        defaultValue: 0,
        type: DataTypes.NUMERIC,
      },
      created_at: {
        defaultValue: DataTypes.NOW,
        allowNull: false,
        type: DataTypes.DATE(6),
      },
      created_by_id: {
        defaultValue: 1,
        allowNull: false,
        type: DataTypes.NUMERIC,
      },
      updated_at: {
        defaultValue: null,
        type: DataTypes.DATE(6),
      },
      updated_by_id: {
        defaultValue: null,
        type: DataTypes.NUMERIC,
      },
      deleted_at: {
        defaultValue: null,
        type: DataTypes.DATE(6),
      },
      deleted_by_id: {
        defaultValue: null,
        type: DataTypes.NUMERIC,
      },
      // Other fields...
    },
    {
      sequelize,
      tableName: "users",
      modelName: "USERS",
      schema: process.env.NODE_MSSQL_MAINSCHEMA,
      freezeTableName: true,
      timestamps: false,
      raw: true,
    }
  );

  // users.associate = function (models) {
  //   users.hasMany(models.users, {
  //     foreignKey: "created_by_id",
  //     as: "createdByUser",
  //   });
  // };

  return USERS;
};
