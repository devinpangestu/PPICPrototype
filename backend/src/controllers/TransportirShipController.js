import db from "../models/index.js";
import { successResponse, errorResponse, uniqueId } from "../helpers/index.js";
import { Op } from "sequelize";
import { getUserID } from "../utils/auth.js";

export const TransportirShipList = async (req, res) => {
  const { transportir_id, search, page_number, page_size } = req.query;
  try {
    const whereClause = {
      [Op.or]: [
        {
          [Op.and]: [{ deleted_at: null }],
        },
      ],
    };

    if (search) {
      whereClause[Op.or].push({ name: { [Op.like]: `%${search}%` } });
      whereClause[Op.or].push({ ship_id: { [Op.like]: `%${search}%` } });
    }

    const data = await db.LOG_TRANSPORTIRS.findOne({
      where: { id: transportir_id },
      include: [
        {
          model: db.USERS,
          as: "crtd_by",
          attributes: ["id", "name"],
        },
        {
          model: db.LOG_TRANSPORTIR_SHIP,
          as: "ships",
          where: { [Op.and]: whereClause[Op.or] },
          include: [
            {
              model: db.USERS,
              as: "crtd_by",
              attributes: ["id", "name"],
            },
          ],
          limit: page_size,
          offset: page_size * (page_number - 1),
        },
      ],
    });
    const dataToCount = await db.LOG_TRANSPORTIR_SHIP.findAndCountAll({
      where: { [Op.and]: { deleted_at: null, transportir_id } },
    });

    data.dataValues.types = JSON.parse(data.dataValues.types);

    for (let key in data.dataValues.ships) {
      data.dataValues.ships[key].capacity =
        data.dataValues.ships[key].capacity + "";
    }

    return successResponse(req, res, {
      transportir: data,
      ships: data.ships,
      total: dataToCount.count,
    });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const TransportirShipCreate = async (req, res) => {
  const { transportir_id, ship_id, name, capacity, mass } = req.body.rq_body;

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
    //check if id ship is exist
    if (isMass) {
      for (let key in mass) {
        let rowToInsert = mass[key];
        const checkShipId = await db.LOG_TRANSPORTIR_SHIP.findOne({
          where: { ship_id: rowToInsert.ship_id, deleted_at: null },
        });

        if (checkShipId) {
          return errorResponse(req, res, "Data Transportasi telah ada");
        }

        //check if name is exist
        const checkName = await db.LOG_TRANSPORTIR_SHIP.findOne({
          where: { name: rowToInsert.name, deleted_at: null },
        });

        if (checkName) {
          return errorResponse(
            req,
            res,
            "Nama Transportasi telah pernah dipakai"
          );
        }

        await db.LOG_TRANSPORTIR_SHIP.create({
          transportir_id: rowToInsert.transportir_id,
          ship_id: rowToInsert.ship_id,
          name: rowToInsert.name,
          capacity: rowToInsert.capacity,
          created_by_id: userId,
          updated_by_id: userId,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
      return successResponse(req, res, "Success Import Data Transportasi");
    } else {
      const checkShipId = await db.LOG_TRANSPORTIR_SHIP.findOne({
        where: { ship_id },
      });

      if (checkShipId) {
        return errorResponse(req, res, "Data Transportasi telah ada");
      }

      //check if name is exist
      const checkName = await db.LOG_TRANSPORTIR_SHIP.findOne({
        where: { name },
      });

      if (checkName) {
        return errorResponse(
          req,
          res,
          "Nama Transportasi telah pernah dipakai"
        );
      }

      await db.LOG_TRANSPORTIR_SHIP.create({
        transportir_id,
        ship_id,
        name,
        capacity,
        created_by_id: userId,
        updated_by_id: userId,
        created_at: new Date(),
        updated_at: new Date(),
      });

      return successResponse(req, res, "Success Insert Data Transportasi");
    }
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const TransportirShipGet = async (req, res) => {
  const id = req.params.id;
  try {
    const data = await db.LOG_TRANSPORTIR_SHIP.findOne({
      where: { id },
      include: [
        {
          model: db.USERS,
          as: "crtd_by",
          attributes: ["id", "name"],
        },
      ],
    });

    data.dataValues.capacity += "";

    return successResponse(req, res, data);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const TransportirShipEdit = async (req, res) => {
  const { transportir_id, ship_id, name, capacity } = req.body.rq_body;

  try {
    // Fetch the previous record from the database
    const userId = getUserID(req);
    const prevRecord = await db.LOG_TRANSPORTIR_SHIP.findOne({
      where: { id: req.params.id },
    });

    // Check if a record with the same ship_id exists and it's different from the previous ship_id
    if (prevRecord && prevRecord.ship_id !== ship_id) {
      return errorResponse(
        req,
        res,
        "Data Transportasi dengan ship_id ini telah ada"
      );
    }

    // Check if a record with the same name exists and it's different from the previous name
    const existingRecordWithName = await db.LOG_TRANSPORTIR_SHIP.findOne({
      where: { name },
    });

    if (existingRecordWithName && existingRecordWithName.id !== prevRecord.id) {
      return errorResponse(req, res, "Nama Transportasi telah pernah dipakai");
    }

    // Update the record if everything checks out
    const updatedRecord = await prevRecord.update({
      transportir_id,
      ship_id,
      name,
      capacity,
      created_by_id: userId,
      updated_by_id: userId,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return successResponse(req, res, "Success Insert Data Transportasi");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const TransportirShipDelete = async (req, res) => {
  const id = req.params.id;
  try {
    const userId = getUserID(req);
    const checkId = await db.LOG_TRANSPORTIR_SHIP.findOne({
      where: {
        id,
      },
    });
    if (!checkId) {
      return errorResponse(
        req,
        res,
        "Data transportasi dengan id tersebut tidak ditemukan atau sudah dihapus"
      );
    }
    const payloadDeletedAt = { deleted_at: new Date(), deleted_by_id: userId };
    await db.LOG_TRANSPORTIR_SHIP.update(payloadDeletedAt, {
      where: { id },
    });

    return successResponse(req, res, "Delete Data Transportasi Success");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const TransportirShipHistory = async (req, res) => {};

export const TransportirShipHistoryAll = async (req, res) => {};

export const TransportirShipTransactions = async (req, res) => {};
