import db from "../models/index.js";
import { successResponse, errorResponse, uniqueId } from "../helpers/index.js";
import { Op } from "sequelize";
import bcrypt from "bcrypt";
import { getUserID } from "../utils/auth.js";
import { exp } from "mathjs";

export const UserList = async (req, res) => {
  const page_number = Number(req.query.page_number) || 1; // Default to page 1 if not provided
  const page_size = Number(req.query.page_size) || 10; // Default page size to 10 if not provided
  const offset = (page_number - 1) * page_size;
  const ppic_ids = req.query.ppic_ids || null;
  try {
    const userId = getUserID(req);
    if (!userId) {
      return errorResponse(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    const roleWhereClause = {
      [Op.or]: [],
    };
    if (ppic_ids) {
      JSON.parse(ppic_ids).forEach((el) => {
        roleWhereClause[Op.or].push({ id: el });
      });
    }

    const data = await db.USERS.findAndCountAll({
      include: [
        {
          where: ppic_ids ? roleWhereClause : {},
          model: db.ROLES,
          as: "role",
        },
      ],
      attributes: {
        exclude: [
          "password",
          "role_id",
          "created_by_id",
          "updated_by_id",
          "deleted_by_id",
        ],
      },
      where: { deleted_at: null },
      order: [["id", "ASC"]],
      limit: page_size,
      offset,
    });
    for (let key in data.rows) {
      data.rows[key].dataValues.role.dataValues.permissions =
        data.rows[key].dataValues.role.dataValues.permissions.split(",");
    }
    const totalRecords = data.count;
    const totalPages = Math.ceil(totalRecords / page_size);

    return successResponse(req, res, { users: data.rows, total: totalRecords });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const UserCreate = async (req, res) => {
  const { user_id, role_id, name } = req.body.rq_body;

  try {
    const userId = getUserID(req);
    if (!userId) {
      return errorResponse(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    // check if all rq_body is provided
    if (!user_id || !role_id || !name) {
      return errorResponse(req, res, "Please provide all required fields");
    }
    // check if user_id is same as before or unique than others then pass but if same as other row then return error
    const user = await db.USERS.findOne({
      where: { user_id },
    });
    if (user) {
      return errorResponse(req, res, "User ID already exist");
    }
    // check if requested role_id is valid or exclude super_user
    const role = await db.ROLES.findOne({
      where: { id: role_id, super_user: false },
    });
    if (!role) {
      return errorResponse(req, res, "Role not found");
    }

    //create password base on user_id and decode it
    const passwordToHash = await bcrypt.hash(user_id, 4);

    const payload = {
      user_id,
      role_id,
      name,
      password: passwordToHash,
      created_at: new Date(),
      created_by_id: userId,
      updated_at: new Date(),
      onesignal_player_id: "[]",
    };
    await db.USERS.create(payload);

    return successResponse(req, res, "New User Created Successfully");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const UserGet = async (req, res) => {
  const { user_id } = req.params;
  try {
    const userId = getUserID(req);
    if (!userId) {
      return errorResponse(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    const data = await db.USERS.findOne({
      include: [
        {
          model: db.ROLES,
          as: "role",
          attributes: ["id", "desc_", "super_user", "permissions"],
        },
      ],
      attributes: {
        exclude: [
          "password",
          "role_id",
          "created_by_id",
          "updated_by_id",
          "deleted_by_id",
        ],
      },
      where: { user_id },
    });
    data.dataValues.role.dataValues.permissions =
      data.dataValues.role.dataValues.permissions.split(",");

    return successResponse(req, res, data);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const UserEdit = async (req, res) => {
  const { user_id, role_id, name } = req.body.rq_body;
  const prev_user_id = req.params.user_id;
  try {
    const userId = getUserID(req);
    if (!userId) {
      return errorResponse(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    // check if all rq_body is provided
    if (!user_id || !role_id || !name) {
      return errorResponse(req, res, "Please provide all required fields");
    }
    //get id from prev_user_id
    const userToChange = await db.USERS.findOne({
      attributes: ["id"],
      where: { user_id: prev_user_id },
    });
    if (!userToChange) {
      return errorResponse(req, res, "User not found");
    }

    // check if user_id is same as before or unique than others then pass but if same as other row then return error

    const user = await db.USERS.findOne({
      where: { user_id },
    });
    if (user && user.id !== userToChange.id) {
      return errorResponse(req, res, "User ID already exist");
    }

    // check if requested role_id is valid or exclude super_user
    const role = await db.ROLES.findOne({
      where: { id: role_id, super_user: false },
    });
    if (!role) {
      return errorResponse(req, res, "Role not found");
    }

    const payload = {
      user_id,
      role_id,
      name,
      updated_at: new Date(),
    };
    const updatedUser = await db.USERS.update(payload, {
      where: { id: userToChange.id },
    });

    return successResponse(req, res, { updatedUser });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const UserDelete = async (req, res) => {
  try {
    const userId = getUserID(req);
    if (!userId) {
      return errorResponse(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    const { user_id } = req.params;
    const user = await db.USERS.findOne({
      where: { user_id },
    });
    if (!user) {
      return errorResponse(req, res, "User not found");
    }
    const payloadDeletedAt = { deleted_at: new Date(), deleted_by_id: userId };
    await user.update(payloadDeletedAt, { where: { user_id } });
    return successResponse(req, res, "User deleted successfully");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const UserResetPwd = async (req, res) => {
  const { user_id } = req.params;

  try {
    const userId = getUserID(req);
    if (!userId) {
      return errorResponse(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }

    const user = await db.USERS.findOne({
      where: { user_id },
    });
    if (!user) {
      return errorResponse(req, res, "User not found");
    }

    //hash new password
    const newPasswordToHash = await bcrypt.hash(user_id, 4);
    const payload = {
      password: newPasswordToHash,
      updated_at: new Date(),
      updated_by_id: userId,
      password_changed_at: null,
    };
    await db.USERS.update(payload, {
      where: { user_id },
    });
    return successResponse(req, res, "Reset Password Success");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const UserVerifyEmail = async (req, res) => {
  //TODO FLOW PENDAFTARAN SUPPLIER
  try {
    const { token_id, token_frag } = req.params;
    const checkToken = await db.TOKENS.findOne({
      where: { id: token_id, token: token_frag, status: "email-verification" },
    });
    if (!checkToken) {
      return errorResponse(req, res, "Invalid Link");
    }
    if (checkToken.expired_at < new Date()) {
      return errorResponse(
        req,
        res,
        "Link expired, please request to PT Bina Karya Prima for new link"
      );
    }
    const suppliersAccountInfo = await db.SUPPLIERS.findOne({
      where: { ref_id: checkToken.user_id },
    });

    if (!suppliersAccountInfo) {
      return errorResponse(req, res, "Supplier Data not found");
    }

    const password = uniqueId(8);
    const passwordToHash = await bcrypt.hash(password, 4);

    const payload = {
      user_id: suppliersAccountInfo.email,
      role_id: 4,
      name: suppliersAccountInfo.name,
      password: passwordToHash,
      created_at: new Date(),
      created_by_id: userId,
      updated_at: new Date(),
      onesignal_player_id: "[]",
    };
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
