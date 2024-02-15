import jwt from "jsonwebtoken";
import {
  errorResponseBadRequest,
  errorResponseForbidden,
  errorResponseUnauthorized,
  errorResponse,
  successResponse,
} from "../helpers/index.js";
import env from "../utils/validateEnv.js";
import createHttpError from "http-errors";

export const verifyTokenAndRole = (permissions, permissionsCheck = true) => {
  return (req, res, next) => {
    if (!req.header("Authorization")) {
      return errorResponseUnauthorized(
        req,
        res,
        "Access denied. No user information provided."
      );
    }

    const token = req.header("Authorization").split(" ")[1];

    if (!token) {
      return errorResponseUnauthorized(
        req,
        res,
        "Access denied. No user information provided."
      );
    }

    try {
      jwt.verify(token, env.SECRET_AUTH, (err, decoded) => {
        // Check if the token has expired
        const currentTime = new Date().getTime() / 1000;

        if (err) {
          return errorResponse(
            req,
            res,
            "Your session has expired, please log in again"
          );
        }

        if (permissionsCheck) {
          const listOfPermissions = decoded.permissions;

          if (!listOfPermissions.includes(permissions)) {
            return errorResponseForbidden(
              req,
              res,
              "Access denied. Ask admin for permissions"
            );
          }
        }
        // Token is valid, you can proceed with the request
        req.user = decoded; // Store the decoded token data in the request object
        next();
      });
    } catch (error) {
      return errorResponseBadRequest(
        req,
        res,
        "Your session is expired, please login again"
      );
    }
  };
};

export const userIsAuthenticated = () => {
  return (req, res, next) => {
    if (!req.header("Authorization")) {
      return errorResponseUnauthorized(
        req,
        res,
        "Access denied. No user information provided."
      );
    }

    const token = req.header("Authorization").split(" ")[1];

    if (!token) {
      return errorResponseUnauthorized(
        req,
        res,
        "Access denied. No user information provided."
      );
    }

    try {
      jwt.verify(token, env.SECRET_AUTH, (err, decoded) => {
        // Check if the token has expired

        if (err) {
          return errorResponse(
            req,
            res,
            "Your session has expired, please log in again"
          );
        }
        // Token is valid, you can proceed with the request
        req.user = decoded; // Store the decoded token data in the request object
        next();
      });
    } catch (error) {
      return errorResponseBadRequest(
        req,
        res,
        "Your session is expired, please login again"
      );
    }
  };
};
