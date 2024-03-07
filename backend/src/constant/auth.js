import dotenv from "dotenv";

dotenv.config();
export const TOKEN_ISSUER = "bkp-approval-api";
export const TOKEN_TYPE_ACCESS = "access";
export const TOKEN_TYPE_SESSION = "session";
export const TOKEN_TYPE_REFRESH = "refresh";
export const SECRET_REFRESH = process.env.SECRET_REFRESH;
export const SECRET_ACCESS = process.env.SECRET_ACCESS;
export const SECRET_AUTH = process.env.SECRET_AUTH;
export const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION;
export const ACCESS_TOKEN_EXPIRATION = process.env.ACCESS_TOKEN_EXPIRATION;
