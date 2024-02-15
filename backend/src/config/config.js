import dotenv from "dotenv";

dotenv.config();

const x = {
  development: {
    host: process.env.NODE_MSSQL_HOST,
    port: process.env.NODE_MSSQL_PORT,
    database: "PPICMonitoring",
    dialect: process.env.NODE_MSSQL_DIALECT,
    username: process.env.NODE_MSSQL_USER,
    password: process.env.NODE_MSSQL_PASSWORD,

    dialectOptions: {
      connectString: process.env.NODE_MSSQL_CONNECTIONSTRING,
      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    },
    logging: false,
  },

  test: {
    dialect: process.env.NODE_MSSQL_DIALECT,
    username: process.env.NODE_MSSQL_USER,
    password: process.env.NODE_MSSQL_PASSWORD,

    dialectOptions: {
      connectString: process.env.NODE_MSSQL_CONNECTIONSTRING,
      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    },

    logging: false,
  },
  production: {
    dialect: process.env.NODE_MSSQL_DIALECT,
    username: process.env.NODE_MSSQL_USER,
    password: process.env.NODE_MSSQL_PASSWORD,

    dialectOptions: {
      connectString: process.env.NODE_MSSQL_CONNECTIONSTRING,
      schema: process.env.NODE_MSSQL_MAINSCHEMA,
    },

    logging: false,
  },
};

export default x;
