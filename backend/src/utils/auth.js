import jwt from "jsonwebtoken";
import { Decrypt } from "./encryption.js";
import { errorResponseUnauthorized } from "../helpers/index.js";
import { constant, TokenTypeBearer } from "../constant/index.js";

export const getTokenStr = (req) => {
  if (!req.header("Authorization")) {
    return false;
  } else {
    if (req.header("Authorization").split(" ")[0] !== TokenTypeBearer) {
      return false;
    } else {
      const bearer = req.header("Authorization").split(" ")[1];
      return bearer;
    }
  }
};

export const veriftJWT = () => {
  const tokenStr = getTokenStr();
  if (!tokenStr) {
    return false;
  }
  const token = jwt.decode(tokenStr);
  if (!token) {
    return false;
  }
  if (token.exp < Date.now() / 1000) {
    return false;
  }

  return true;
};

export const GetTokenClaims = (req) => {
  if (!req) {
    return false;
  } else {
    const token = getTokenStr(req);

    try {
      const tokenClaims = jwt.verify(token, process.env.SECRET_AUTH);

      return tokenClaims;
    } catch (err) {
      console.error("Token verification failed:", err);
      return false; // or handle the error as needed
    }
  }
};

export const getUserID = (req) => {
  if (!GetTokenClaims(req)) {
    return;
  } else {
    const tokenClaims = Decrypt(GetTokenClaims(req).user_id);
    return tokenClaims;
  }
};
export const getUserName = (req) => {
  if (!GetTokenClaims(req)) {
    return;
  } else {
    const tokenClaims = GetTokenClaims(req).user_name;
    return tokenClaims;
  }
};
export const getSupplierID = (req) => {
  if (!GetTokenClaims(req)) {
    return;
  } else {
    const tokenClaims = GetTokenClaims(req)?.supplier?.ref_id;
    return tokenClaims;
  }
};
