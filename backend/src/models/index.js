import fs from "fs";
import Sequelize from "sequelize";
import * as path from "path";

import { fileURLToPath,pathToFileURL } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url.toString());

const __dirname = dirname(__filename);

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
import configModule from "../config/config.js";
const config = configModule[env];

const dbss = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}
const modelFiles = fs
  .readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  );

const dbs = async () => {
  for (const file of modelFiles) {
    const modulePath = path.join(__dirname, file);

    const modelModule = await import(pathToFileURL(modulePath));
    const model = modelModule.default(sequelize, Sequelize.DataTypes);

    dbss[model.name] = model;
  }

  // Now that all models are imported, associate them
  Object.keys(dbss).forEach((modelName) => {
    if (dbss[modelName].associate) {
      dbss[modelName].associate(dbss);
    }
  });

  dbss.sequelize = sequelize;
  dbss.Sequelize = Sequelize;

  return dbss;
  // You can now use 'db' here with all the models populated
};

const db = await dbs();
export default db;
