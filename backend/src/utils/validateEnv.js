import { cleanEnv } from "envalid";
import { port, str, num, bool } from "envalid/dist/validators.js";

export default cleanEnv(process.env, {
  NODE_MSSQL_USER: str(),
  NODE_MSSQL_PASSWORD: str(),
  NODE_MSSQL_CONNECTIONSTRING: str(),
  NODE_MSSQL_HOST: str(),
  NODE_MSSQL_PORT: str(),
  NODE_MSSQL_SERVICE_NAME: str(),
  NODE_MSSQL_DIALECT: str(),
  NODE_MSSQL_MAINSCHEMA: str(),
  NODE_ORACLEDB_MASTERSCHEMA: str(),
  NODE_ORACLEDB_MASTERPOSCHEMA: str(),
  NODE_MSSQL_LINKEDSERVERNAME: str(),
  JWT_ACCESS_EXPIRATION_MINUTES: num(),
  JWT_REFRESH_EXPIRATION_DAYS: num(),
  JWT_RESET_PASSWORD_EXPIRATION_MINUTES: num(),
  JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: num(),
  REFRESH_TOKEN_EXPIRATION: num(),
  REFRESH_TOKEN_REFRESH_PERIOD: num(),
  ACCESS_TOKEN_EXPIRATION: num(),
  SECRET_AUTH: str(),
  REPORT_PATH: str(),
  SECRET_ACCESS: str(),
  SECRET_REFRESH: str(),
  NODE_ENV: str(),
  NSQ_URL: str(),
  BASE_URL: str(),
  BASE_URL_CLIENT: str(),
  API_PORT: port(),
  WEB_PORT: port(),
  SESSION_SECRET: str(),
  JWT_SECRET: str(),
  EMAIL_HOST: str(),
  EMAIL_PORT: port(),
  EMAIL_PORT_SECURE: port(),
  EMAIL_SECURE: bool(),
  EMAIL_USERNAME: str(),
  EMAIL_PASSWORD: str(),
  EMAIL_CIPHERS: str(),
});
