import Sequelize from "sequelize";

const sequelize = new Sequelize({
  dialect: process.env.NODE_MSSQL_DIALECT,
  username: process.env.NODE_MSSQL_USER,
  password: process.env.NODE_MSSQL_PASSWORD,
  dialectOptions: {
    connectString: process.env.NODE_MSSQL_CONNECTIONSTRING,
  },
  schema: process.env.NODE_MSSQL_MAINSCHEMA,
});

console.log("Connecting to the following database:");
console.log("Service Name:", process.env.NODE_MSSQL_SERVICE_NAME);
console.log("User:", process.env.NODE_MSSQL_USER);
console.log("Host:", process.env.NODE_MSSQL_HOST);
console.log("Port:", process.env.NODE_MSSQL_PORT);
console.log("Dialect:", process.env.NODE_MSSQL_DIALECT);
