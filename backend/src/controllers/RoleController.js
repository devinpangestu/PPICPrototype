import db from "../models/index.js";
import { successResponse, errorResponse, uniqueId } from "../helpers/index.js";
import { Op } from "sequelize";

export const RoleList = async (req, res) => {
  try {
    
    const data = await db.ROLES.findAll({
      attributes: ["id", "desc_", "super_user", "permissions"],
      where: { [Op.not]: [{ id: 1 }] },
      order: [["id", "ASC"]],
    });

    
    for (let key in data) {
      data[key].permissions = data[key].permissions.split(",");
    }

    return successResponse(req, res, { roles: data });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const RoleCreate = async (req, res) => {};

export const RoleGet = async (req, res) => {
  try {
    
    const { id } = req.params;
    
    const data = await db.ROLES.findOne({
      attributes: ["id", "desc_", "super_user", "permissions"],
      where: { user_id: id },
    });
    
    return successResponse(req, res, { role: data });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const RoleEdit = async (req, res) => {};

export const RoleDelete = async (req, res) => {};

export const RoleEditPermissions = async (req, res) => {
  const permissionsList = req.body.rq_body.permissions;

  try {
    let permissions_group = await db.PERMISSIONS_GROUP.findAll({
      attributes: ["id", "name"],
    });
    let permissions = await db.PERMISSIONS.findAll({
      attributes: ["id", "group_id", "name"],
    });

    //change the group_id to name of permissions_group
    const ConcatPermissionsWithId = {};

    for (let key in permissions) {
      ConcatPermissionsWithId[permissions[key].id] =
        permissions_group[permissions[key].group_id - 1].name +
        "@" +
        permissions[key].name;
    }

    for (let key in permissionsList) {
      const arrayToInsert = [];
      if (permissionsList[key].length == 0) {
        const updateTable = await db.ROLES.update(
          { permissions: " " },
          {
            attributes: ["permissions"],
            where: { id: key },
          }
        );
      } else {
        for (let loopRole of permissionsList[key]) {
          arrayToInsert.push(ConcatPermissionsWithId[loopRole]);
        }

        const updateTable = await db.ROLES.update(
          { permissions: `${arrayToInsert}` },
          {
            attributes: ["permissions"],
            where: { id: key },
          }
        );
      }
    }

    return successResponse(req, res, "update Role Success");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
