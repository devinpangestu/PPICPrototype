"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class HZ_PARTY_SITES extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      
    }
  }
  HZ_PARTY_SITES.init(
    {
      
    },
    {
      sequelize,
      modelName: "HZ_PARTY_SITES",
      tableName: "HZ_PARTY_SITES",
      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_ORACLEDB_MASTERSCHEMA,
    }
  );
  return HZ_PARTY_SITES;
};
