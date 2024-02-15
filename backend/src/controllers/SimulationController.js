import db from "../models/index.js";
import { successResponse, errorResponse, uniqueId } from "../helpers/index.js";
import { Op } from "sequelize";
import {
  parsingStringToDateEarly,
  parsingStringToDateLate,
} from "../utils/parsing.js";

export const SimulationCreate = async (req, res) => {
  const date = req.body.rq_body.date;
  let data = req.body.rq_body.data;
  try {
    const simulationData = await db.SIMULATION.findOne({
      where: {
        date_: date,
      },
    });
    if (simulationData) {
      return errorResponse(res, 400, "Simulation already exist");
    }
    //convert object to string
    data = JSON.stringify(data);

    const simulation = await db.SIMULATION.create({
      date_: date,
      data: data,
    });
    return successResponse(req, res, "Simulation created successfully");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const SimulationGet = async (req, res) => {
  const date = req.params.date;
  const startDate = `${date} 00:00:00`;
  const endDate = `${date} 23:59:59`;

  try {
    const simulationData = await db.SIMULATION.findAll({
      where: {
        date_: {
          [Op.between]: [
            parsingStringToDateEarly(date),
            parsingStringToDateLate(date),
          ],
        },
      },
    });
    let response = [];
    if (simulationData.length === 0) {
    } else {
      const data = JSON.parse(simulationData[0].data);
      response.push({
        id: simulationData[0].id,
        date: simulationData[0].date_,
        data: { commodity_fee: data },
      });
    }
    console.log(response);
    return successResponse(req, res, response);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const SimulationEdit = async (req, res) => {
  const date = req.body.rq_body.date;
  let data = req.body.rq_body.data;
  const id = req.params.id;
  try {
    const simulationData = await db.SIMULATION.findOne({
      where: {
        date_: date,
      },
    });
    if (!simulationData) {
      return errorResponse(res, 400, "Simulation not found");
    }
    data = JSON.stringify(data);
    const simulation = await db.SIMULATION.update(
      {
        data: data,
      },
      {
        where: {
          id,
        },
      }
    );
    return successResponse(req, res, "Simulation updated successfully");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
