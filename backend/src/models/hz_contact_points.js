"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class HZ_CONTACT_POINTS extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  HZ_CONTACT_POINTS.init(
    {},
    {
      sequelize,
      modelName: "HZ_CONTACT_POINTS",
      tableName: "HZ_CONTACT_POINTS",
      freezeTableName: true,
      timestamps: false,
      schema: process.env.NODE_ORACLEDB_MASTERSCHEMA,
    }
  );
  return HZ_CONTACT_POINTS;
};
