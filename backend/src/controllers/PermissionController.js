import db from "../models/index.js";
import { successResponse, errorResponse, uniqueId } from "../helpers/index.js";
import { Op } from "sequelize";

export const PermissionGet = async (req, res) => {
  try {
    const data = await db.PERMISSIONS_GROUP.findAll({
      attributes: [
        ["id", "group_id"],
        ["name", "group_name"],
      ],
      include: [
        {
          as: "actions",
          model: db.PERMISSIONS,
          attributes: ["id", "name"],
        },
      ],
    });
    return successResponse(req, res, { permissions: data });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
