import express from "express";
import * as SimulationController from "../../controllers/SimulationController.js";

const router = express.Router();

router.post("/", SimulationController.SimulationCreate);
router.get("/:date", SimulationController.SimulationGet);
router.put("/:id", SimulationController.SimulationEdit);

export default router;
