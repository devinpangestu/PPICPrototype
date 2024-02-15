import db from "../models/index.js";
import { successResponse, errorResponse, uniqueId } from "../helpers/index.js";
import { Op } from "sequelize";
import jwt from "jsonwebtoken";
import * as constant from "../constant/auth.js";
import bcrypt from "bcrypt";
import { Encrypt, Decrypt } from "../utils/encryption.js";
import { getUserID } from "../utils/auth.js";
import moment from "moment";

export const GetAuthenticatedUser = async (req, res, next) => {
  try {
    const user = await db.USERS.findByPk(req.session.user_id);

    return successResponse(req, res, user);
  } catch (error) {
    next(error);
  }
};

//LOGIN
export const Login = async (req, res) => {
  try {
    const { employee_id, password } = req.body.rq_body;
    if (!employee_id || !password) {
      return errorResponse(req, res, "Parameter is missing");
    }

    const user = await db.USERS.findOne({
      where: { user_id: employee_id },
      include: [
        {
          model: db.ROLES,
          as: "role",
        },
        {
          model: db.SUPPLIERS,
          as: "from_supplier",
        },
      ],
    });

    if (!user) {
      return errorResponse(req, res, "User not found");
    }
    const lockMessage = await handleAccountLock(user);
    if (lockMessage) {
      return errorResponse(req, res, lockMessage);
    }

    const passwordIsValid = await bcrypt.compare(
      Decrypt(password),
      user.password
    );

    if (!passwordIsValid) {
      await updateFailedLogin(user);
      return errorResponse(req, res, "Password is not valid");
    }

    //change user.role.permissions from string of array to array of string

    const permissionArray = user.role.permissions.split(",");
    let claims;
    if (!user.dataValues.supplier_id) {
      claims = {
        permissions: permissionArray,
        role: {
          id: user.role.id,
          desc: user.role.desc_,
          super_user: user.role.super_user,
        },
        user_id: Encrypt(user.id),
        employee_id: user.employee_id,
        user_name: user.name,
        password_changed: user.password_changed_at,
        expired_at: new Date().getTime() + 24 * 60 * 60 * 1000,
        email: user.email,
        jti: uniqueId(),
        iat: Math.floor(new Date().getTime() / 1000), // issued at
        iss: constant.TOKEN_ISSUER,
      };
    } else {
      claims = {
        permissions: permissionArray,
        role: {
          id: user.role.id,
          desc: user.role.desc_,
          super_user: user.role.super_user,
        },
        user_id: Encrypt(user.id),
        employee_id: user.employee_id,
        user_name: user.name,
        password_changed: user.password_changed_at,
        expired_at: new Date().getTime() + 24 * 60 * 60 * 1000,
        supplier: user?.from_supplier,
        email: user.email,
        jti: uniqueId(),
        iat: Math.floor(new Date().getTime() / 1000), // issued at
        iss: constant.TOKEN_ISSUER,
      };
    }

    //check access token is expired or not yet created

    const token = jwt.sign(claims, constant.SECRET_AUTH, {
      expiresIn: "24h", // 24 hours
    });

    //insert to token table
    const expirationTime = new Date();
    expirationTime.setMilliseconds(
      expirationTime.getMilliseconds() + 24 * 60 * 60 * 1000
    );
    const tokenObj = {
      id: claims.jti,
      type: constant.TOKEN_TYPE_ACCESS,
      token,
      user_id: Number(user.id),
      issued_at: new Date(),
      expired_at: expirationTime,
    };
    try {
      await db.TOKEN.create(tokenObj);
      console.log("Token created successfully.");
    } catch (error) {
      console.error("Error creating token:", error);
    }

    const data = {
      employee_id: user.employee_id,
      token_type: constant.TOKEN_TYPE_ACCESS,
      access_token: token,
      issued_at: Math.floor(new Date().getTime()),
      expires_in: Math.floor(new Date().getTime() + 24 * 60 * 60 * 1000),
      expired_at: Math.floor(new Date().getTime() + 24 * 60 * 60 * 1000),
    };
    await resetFailedLogin(user);
    return successResponse(req, res, data);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const LoginRfToken = async (req, res) => {};

//LOGOUT
export const Logout = async (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(200);
    }
  });
};

export const ChangePwd = async (req, res) => {
  try {
    const { old_password, new_password, new_password_confirm } =
      req.body.rq_body;
    const userId = getUserID(req);
    if (!userId) {
      return errorResponseUnauthorized(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    const user = await db.USERS.findOne({
      where: { id: userId },
    });
    if (!user) {
      return errorResponse(req, res, "User not found");
    }

    const eligibilityMessage = await checkPasswordChangeEligibility(user);
    if (eligibilityMessage) {
      return errorResponse(req, res, eligibilityMessage);
    }

    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) {
      return errorResponse(req, res, "Old password is incorrect");
    }
    //check new password and confirm password
    if (new_password !== new_password_confirm) {
      return errorResponse(
        req,
        res,
        "New password and confirm password not match"
      );
    }
    //check if new password is same as old password
    const isSame = await bcrypt.compare(new_password, user.password);
    if (isSame) {
      return errorResponse(
        req,
        res,
        "New password cannot be same as old password"
      );
    }
    //hash new password
    const newPasswordToHash = await bcrypt.hash(new_password, 4);
    const payload = {
      password: newPasswordToHash,
      updated_at: new Date(),
      password_changed_at: new Date(),
    };
    await db.USERS.update(payload, {
      where: { id: userId },
    });
    return successResponse(req, res, "Success Changing Password");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

//NOT USED
async function generateAndSetNewRefreshToken(userId) {
  try {
    // Generate a new refresh token
    const newRefreshToken = jwt.sign(
      { user_id: userId },
      constant.SECRET_AUTH,
      {
        expiresIn: constant.REFRESH_TOKEN_EXPIRATION,
      }
    );

    // Update the user's refresh token in the database
    await db.REFRESH_TOKENS.update(
      { token: newRefreshToken },
      { where: { user_id: userId } }
    );

    return newRefreshToken;
  } catch (error) {
    // Handle any errors that occur during token generation or database update
    throw new Error("Unable to generate or set a new refresh token");
  }
}

const updateFailedLogin = async (user) => {
  const failedLoginAttempts = (user.failed_login_attempts || 0) + 1;

  // Check if the maximum attempts are reached before updating
  if (failedLoginAttempts >= 5) {
    await db.USERS.update(
      {
        failed_login_attempts: 0,
        last_failed_login: new Date(),
        // Set account_lock_timestamp if max attempts are reached
        account_lock_timestamp: new Date(),
        account_lock_count: (user.account_lock_count || 0) + 1,
      },
      {
        where: { user_id: user.user_id },
      }
    );
  } else {
    await db.USERS.update(
      {
        failed_login_attempts: failedLoginAttempts,
        last_failed_login: new Date(),
      },
      {
        where: { user_id: user.user_id },
      }
    );
  }
};

// Function to reset failed login attempts and last_failed_login
const resetFailedLogin = async (user) => {
  await db.USERS.update(
    {
      failed_login_attempts: 0,
      last_failed_login: null,
      account_lock_count: 0,
      account_lock_timestamp: null,
    },
    {
      where: { user_id: user.user_id },
    }
  );
};
const calculateLockDuration = (lockCount) => {
  // Exponential increase in lock duration based on lock count
  const baseLockDuration = 5 * 60 * 1000; // Base lock duration (5 minutes)
  const maxLockDuration = 24 * 60 * 60 * 1000; // Maximum lock duration (1 hour)

  // Calculate the exponential increase
  const lockDuration = Math.min(
    baseLockDuration * Math.pow(2, lockCount - 1),
    maxLockDuration
  );

  return lockDuration;
};

const handleAccountLock = async (user) => {
  if (user && user.account_lock_timestamp) {
    const lockDuration = calculateLockDuration(user.account_lock_count);
    const unlockTime = new Date(
      user.account_lock_timestamp.getTime() + lockDuration
    );

    if (new Date() < unlockTime) {
      // Account is still locked, return appropriate response
      const timeLeftMillis = unlockTime - new Date();
      const timeLeftSeconds = Math.floor(timeLeftMillis / 1000);
      const timeLeftMinutes = Math.floor(timeLeftSeconds / 60);
      const timeLeftHours = Math.floor(timeLeftMinutes / 60);

      return `Account locked. Try again after ${
        !timeLeftHours ? "" : timeLeftHours + " hours, "
      } ${timeLeftMinutes % 60} minutes, and ${timeLeftSeconds % 60} seconds`;
    } else {
      // Unlock the account if the lock duration has passed
      await db.USERS.update(
        {
          account_lock_timestamp: null,
          failed_login_attempts: 0,
        },
        {
          where: { user_id: user.user_id },
        }
      );
    }
  }
  return null;
};

const checkPasswordChangeEligibility = async (user) => {
  if (user && user.password_changed_at) {
    const minChangePasswordDuration = 24 * 60 * 60 * 1000; // Base lock duration (24 hour)
    const maxChangePasswordDuration = 90 * 24 * 60 * 60 * 1000;
    const canChangePasswordTime = new Date(
      user.password_changed_at.getTime() + minChangePasswordDuration
    );

    if (new Date() < canChangePasswordTime) {
      // Account is still locked, return appropriate response
      const timeLeftMillis = canChangePasswordTime - new Date();
      const timeLeftSeconds = Math.floor(timeLeftMillis / 1000);
      const timeLeftMinutes = Math.floor(timeLeftSeconds / 60);
      const timeLeftHours = Math.floor(timeLeftMinutes / 60);

      return `Can't change the password after changing new password. Try again after ${
        !timeLeftHours ? "" : timeLeftHours + " hours, "
      } ${timeLeftMinutes % 60} minutes, and ${timeLeftSeconds % 60} seconds`;
    } else {
      // Unlock the account if the lock duration has passed
      await db.USERS.update(
        {
          password_changed_at: new Date(),
        },
        {
          where: { user_id: user.user_id },
        }
      );
      return null; // Password change is allowed
    }
  }
  return null;
};
