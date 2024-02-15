import db from "../models/index.js";
import { successResponse, errorResponse, uniqueId } from "../helpers/index.js";
import { Op } from "sequelize";
import bcrypt from "bcrypt";
import { getUserID } from "../utils/auth.js";

export const UserList = async (req, res) => {
  const page_number = Number(req.query.page_number) || 1; // Default to page 1 if not provided
  const page_size = Number(req.query.page_size) || 10; // Default page size to 10 if not provided
  const offset = (page_number - 1) * page_size;
  const ppic_ids = req.query.ppic_ids || null;
  try {
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
  const { employee_id, role_id, name } = req.body.rq_body;
  const userId = getUserID(req);
  try {
    // check if all rq_body is provided
    if (!employee_id || !role_id || !name) {
      return errorResponse(req, res, "Please provide all required fields");
    }
    // check if employee_id is same as before or unique than others then pass but if same as other row then return error
    const user = await db.USERS.findOne({
      where: { employee_id },
    });
    if (user) {
      return errorResponse(req, res, "Employee ID already exist");
    }
    // check if requested role_id is valid or exclude super_user
    const role = await db.ROLES.findOne({
      where: { id: role_id, super_user: false },
    });
    if (!role) {
      return errorResponse(req, res, "Role not found");
    }

    //create password base on employee_id and decode it
    const passwordToHash = await bcrypt.hash(employee_id, 4);

    const payload = {
      employee_id,
      role_id,
      name,
      password: passwordToHash,
      created_at: new Date(),
      created_by_id: userId,
      updated_at: new Date(),
      onesignal_player_id: "[]",
    };
    const createUser = await db.USERS.create(payload);

    return successResponse(req, res, "New User Created Successfully");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const UserGet = async (req, res) => {
  const { user_id } = req.params;
  try {
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
  const { employee_id, role_id, name } = req.body.rq_body;
  const prev_employee_id = req.params.employee_id;
  try {
    // check if all rq_body is provided
    if (!employee_id || !role_id || !name) {
      return errorResponse(req, res, "Please provide all required fields");
    }
    //get id from prev_employee_id
    const userToChange = await db.USERS.findOne({
      attributes: ["id"],
      where: { employee_id: prev_employee_id },
    });
    if (!userToChange) {
      return errorResponse(req, res, "User not found");
    }

    // check if employee_id is same as before or unique than others then pass but if same as other row then return error

    const user = await db.USERS.findOne({
      where: { employee_id },
    });
    if (user && user.id !== userToChange.id) {
      return errorResponse(req, res, "Employee ID already exist");
    }

    // check if requested role_id is valid or exclude super_user
    const role = await db.ROLES.findOne({
      where: { id: role_id, super_user: false },
    });
    if (!role) {
      return errorResponse(req, res, "Role not found");
    }

    const payload = {
      employee_id,
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
  const userId = getUserID(req);
  try {
    const { employee_id } = req.params;
    const user = await db.USERS.findOne({
      where: { employee_id },
    });
    if (!user) {
      return errorResponse(req, res, "User not found");
    }
    const payloadDeletedAt = { deleted_at: new Date(), deleted_by_id: userId };
    await user.update(payloadDeletedAt, { where: { employee_id } });
    return successResponse(req, res, "User deleted successfully");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const UserResetPwd = async (req, res) => {
  const { employee_id } = req.params;

  try {
    const user = await db.USERS.findOne({
      where: { employee_id },
    });
    if (!user) {
      return errorResponse(req, res, "User not found");
    }

    //hash new password
    const newPasswordToHash = await bcrypt.hash(employee_id, 4);
    const payload = {
      password: newPasswordToHash,
      updated_at: new Date(),
    };
    await db.USERS.update(payload, {
      where: { employee_id },
    });
    return successResponse(req, res, "Reset Password Success");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
