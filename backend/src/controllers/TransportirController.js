import db from "../models/index.js";
import { successResponse, errorResponse, uniqueId } from "../helpers/index.js";
import { Op } from "sequelize";
import { getUserID } from "../utils/auth.js";

export const TransportirList = async (req, res) => {
  const { page_number, page_size, search } = req.query;
  try {
    const whereClause = { deleted_at: null };

    if (search) {
      whereClause["id"] = { [Op.like]: `%${search}%` };
    }

    const dataToCount = await db.LOG_TRANSPORTIRS.findAndCountAll({
      where: whereClause,
    });

    const data = await db.LOG_TRANSPORTIRS.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: db.USERS,
          as: "crtd_by",
          attributes: ["id", "name"],
        },
        {
          model: db.LOG_TRANSPORTIR_SHIP,
          as: "ships",

          include: [
            {
              model: db.USERS,
              as: "crtd_by",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      limit: page_size,
      offset: page_size * (page_number - 1),
    });

    data.rows.forEach((row) => {
      row.types = JSON.parse(row.types);
      row.ships.forEach((ship) => {
        ship.capacity = ship.capacity.toString();
      });
    });

    return successResponse(req, res, {
      transportirs: data.rows,
      total: dataToCount.count,
    });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const TransportirCreate = async (req, res) => {
  const { transportir_id, types, name, mass } = req.body.rq_body;

  try {
    const isMass = req.query.mass;
    const userId = getUserID(req);
    if (!userId) {
      return errorResponseUnauthorized(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }

    if (isMass) {
      for (let key in mass) {
        let rowToInsert = mass[key];
        const checkShipId = await db.LOG_TRANSPORTIRS.findOne({
          where: {
            transportir_id: rowToInsert.transportir_id,
            deleted_at: null,
          },
        });

        if (checkShipId) {
          return errorResponse(
            req,
            res,
            "ID Transportasi telah pernah dipakai"
          );
        }

        const checkName = await db.LOG_TRANSPORTIRS.findOne({
          where: { name: rowToInsert.name, deleted_at: null },
        });

        if (checkName) {
          return errorResponse(
            req,
            res,
            `Nama Transportir ${name} telah pernah dipakai`
          );
        }

        await db.LOG_TRANSPORTIRS.create({
          transportir_id: rowToInsert.transportir_id,
          types: JSON.stringify(rowToInsert.types),
          name: rowToInsert.name,
          created_by_id: userId,
          updated_by_id: userId,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
      return successResponse(req, res, {
        message: "Success Insert Data Transportir",
      });
    } else {
      const checkShipId = await db.LOG_TRANSPORTIRS.findOne({
        where: { transportir_id },
      });

      if (checkShipId) {
        return errorResponse(req, res, "ID Transportasi telah pernah dipakai");
      }

      const checkName = await db.LOG_TRANSPORTIRS.findOne({
        where: { name },
      });

      if (checkName) {
        return errorResponse(
          req,
          res,
          `Nama Transportir ${name} telah pernah dipakai`
        );
      }

      const createRow = await db.LOG_TRANSPORTIRS.create({
        transportir_id,
        types: JSON.stringify(types),
        name,
        created_by_id: userId,
        updated_by_id: userId,
        created_at: new Date(),
        updated_at: new Date(),
      });
      return successResponse(req, res, {
        message: "Success Insert Data Transportir",
      });
    }
    //check if id ship is exist
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const TransportirGet = async (req, res) => {
  const id = req.params.id;
  try {
    const data = await db.LOG_TRANSPORTIRS.findOne({
      where: { id, deleted_at: null },
      include: [
        {
          model: db.USERS,
          as: "crtd_by",
          attributes: ["id", "name"],
        },
        {
          model: db.LOG_TRANSPORTIR_SHIP,
          as: "ships",
          include: [
            {
              model: db.USERS,
              as: "crtd_by",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    data.dataValues.types = JSON.parse(data.dataValues.types);

    for (let key in data.dataValues.ships) {
      data.dataValues.ships[key].dataValues.capacity =
        data.dataValues.ships[key].dataValues.capacity + "";
    }

    return successResponse(req, res, data.dataValues);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const TransportirEdit = async (req, res) => {
  const { transportir_id, types, name } = req.body.rq_body;
  const id = req.params.id;
  try {
    const userId = getUserID(req);
    if (!userId) {
      return errorResponseUnauthorized(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    const prevRecord = await db.LOG_TRANSPORTIRS.findOne({
      where: { transportir_id, deleted_at: null },
    });

    if (prevRecord && prevRecord?.id !== id) {
      return errorResponse(
        req,
        res,
        `Tidak bisa mengganti ID ${prevRecord.transportir_id} dengan ID lain`
      );
    }

    const updateRow = await db.LOG_TRANSPORTIRS.update(
      {
        transportir_id,
        types: JSON.stringify(types),
        name,
        updated_by_id: userId,
        updated_at: new Date(),
      },
      { where: { id } }
    );
    return successResponse(req, res, {
      message: "Success Update Data Transportir",
    });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const TransportirDelete = async (req, res) => {
  const id = req.params.id;

  try {
    const userId = getUserID(req);
    if (!userId) {
      return errorResponseUnauthorized(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    const checkId = await db.LOG_TRANSPORTIRS.findOne({
      where: {
        id,
      },
    });
    if (!checkId) {
      return errorResponse(req, res, {
        message:
          "Data transportasi dengan id tersebut tidak ditemukan atau sudah dihapus",
      });
    }
    const payloadDeletedAt = { deleted_at: new Date(), deleted_by_id: userId };
    await db.LOG_TRANSPORTIRS.update(payloadDeletedAt, {
      where: { id },
    });

    return successResponse(req, res, {
      message: "Delete Data Transportasi Success",
    });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const TransportirHistory = async (req, res) => {};

export const TransportirHistoryAll = async (req, res) => {};

export const TransportirTransactions = async (req, res) => {};
