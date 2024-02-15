// db.js

import mssql from "mssql";

export const configMSSQL = {
  development: {
    user: "devinpangestu5",
    password: "Grandchase_213",
    server: "localhost", // You can use 'localhost' if SQL Server is on the same machine
    database: "PPICMonitoring",
    options: {
      trustServerCertificate: true, // For self-signed certificates (remove in production)
    },
    dialect: process.env.NODE_MSSQL_DIALECT,
  },
  test: {
    user: "devinpangestu5",
    password: "Grandchase_213",
    server: "localhost", // You can use 'localhost' if SQL Server is on the same machine
    database: "PPICMonitoring",
    options: {
      trustServerCertificate: true, // For self-signed certificates (remove in production)
    },
  },
  production: {
    user: "devinpangestu5",
    password: "Grandchase_213",
    server: "localhost", // You can use 'localhost' if SQL Server is on the same machine
    database: "PPICMonitoring",
    options: {
      trustServerCertificate: true, // For self-signed certificates (remove in production)
    },
  },
};

export async function connectToDatabase(configToConnect) {
  try {
    const pool = await mssql.connect(configToConnect);
    console.log("Connected to the database");
    return pool;
  } catch (err) {
    console.error("Error connecting to the database:", err.message);
    throw err;
  }
}
