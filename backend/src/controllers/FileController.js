import db from "../models/index.js";
import { successResponse, errorResponse, uniqueId } from "../helpers/index.js";
import { Op } from "sequelize";
import fs from "fs";
import path from "path";
import { constant } from "../constant/index.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { getUserID } from "../utils/auth.js";
import mimetype from "mime";

const __filename = fileURLToPath(import.meta.url.toString());
const __dirname = dirname(__filename);

const [
  FILE_TYPE_CONTRACT,
  FILE_TYPE_CARGO_READINESS,
  FILE_TYPE_SPAL,
  FILE_TYPE_SPAD,
  FILE_TYPE_LOGISTIC_INSURANCE,
  FILE_TYPE_BL,
] = ["contract", "cargo_readiness", "spal", "spad", "logistic_insurance", "bl"];
const FILE_TYPE_OFFER = [FILE_TYPE_CONTRACT, FILE_TYPE_CARGO_READINESS];
const FILE_TYPE_LOGISTIC = [
  FILE_TYPE_SPAL,
  FILE_TYPE_SPAD,
  FILE_TYPE_LOGISTIC_INSURANCE,
  FILE_TYPE_BL,
];
let FILE_TYPE_SUPPORTED = [];

const FILE_EXT_PDF = ".pdf";

FILE_TYPE_SUPPORTED = FILE_TYPE_SUPPORTED.concat(FILE_TYPE_OFFER);
FILE_TYPE_SUPPORTED = FILE_TYPE_SUPPORTED.concat(FILE_TYPE_LOGISTIC);

export const UploadSingle = async (req, res) => {
  try {
    const userId = getUserID(req);
    const { type, unique_id, type_text } = req.body;
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ error: { error_message: "File not provided" } });
    }

    if (file.mimetype !== "application/pdf") {
      return errorResponse(req, res, "File type must be PDF");
    }

    let pathPrefix = "";
    if (FILE_TYPE_OFFER.includes(type)) {
      pathPrefix = "files/offer";
    } else if (FILE_TYPE_LOGISTIC.includes(type)) {
      pathPrefix = "files/logistic";
    }
    // Construct the file URL and storage path
    const fileName = `${type_text}-${unique_id}${FILE_EXT_PDF}`;
    const filePath = `src/bin/storages/${pathPrefix}/${type}/${fileName}`;
    const prefixURL = `v1/${pathPrefix}/${type}/${fileName}`;
    const fileURL = `${process.env.BASE_URL}/${prefixURL}`;

    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, Buffer.from(file.buffer));
    } catch (mkdirError) {
      console.error("Error creating directories:", mkdirError);
      return res.status(500).json({ error: { error_message: mkdirError } });
    }
    console.log(71);
    // Insert file details into the database
    await db.FILES.create({
      uid_: req.body.uid,
      url: fileURL,
      type,
      unique_id,
      storage_path: filePath,
      created_by_id: userId,
      created_at: new Date(),
    });

    //get all files in transaction
    console.log(83);
    const whereOfferClause = {
      [Op.and]: [
        {
          [Op.or]: [{ deleted_at: null }, { status: "approved" }],
        },
      ],
    };
    console.log(90);
    const filesInTransaction = [];
    console.log(91);
    const lOffer = await db.LOG_OFFERS.findOne({
      where: {
        logistic_offer_id: unique_id,
      },
    });
    console.log(97);
    const offerId = lOffer.dataValues.commodity_offer_id;
    const getTrnsId = await db.OFFERS.findOne({
      where: {
        unique_id: offerId,
      },
    });
    console.log(104);
    const trnsId = getTrnsId.transaction_id;
    console.log(106);
    const transactions = await db.trns.findOne({
      where: {
        id: trnsId,
      },
      include: [
        {
          model: db.OFFERS,
          as: "offer",
          where: whereOfferClause,
          attributes: {
            include: [
              ["risk_mgmt_price_recommendation", "risk_mgmt_price_rec"],
            ],
            exclude: ["risk_mgmt_price_recommendation"],
          },
          include: [
            {
              model: db.USERS,
              as: "crtd_by",
              attributes: ["id", "name", "employee_id"],
            },
            {
              model: db.USERS,
              as: "updtd_by",
              attributes: ["id", "name", "employee_id"],
            },
            {
              model: db.USERS,
              as: "dealer",
              attributes: ["id", "name", "employee_id"],
            },
            {
              model: db.USERS,
              as: "top_mgmt",
              attributes: ["id", "name", "employee_id"],
            },
            {
              model: db.USERS,
              as: "risk_mgmt",
              attributes: ["id", "name", "employee_id"],
            },
            {
              model: db.m_cmdty,
              as: "cmdty",
            },
            {
              model: db.m_whs,
              as: "whs",
            },
            {
              model: db.mhOverLoc,
              as: "hOver_Loc",
            },
            {
              model: db.SUPPLIERS,
              as: "spplr",
            },
            {
              model: db.LOG_OFFERS,
              as: "lOffers",
              attributes: {
                include: [
                  ["actual_loading_date", "actloaddate"],
                  ["actual_loading_updated_at", "actloadupdate"],
                  ["actual_loading_updated_by", "actloadupdateby"],
                  ["commodity_offer_id", "cOfferId"],
                  ["delivered_updated_at", "dlvrdupdate"],
                  ["delivered_updated_by", "dlvrdupdateby"],
                  ["delivery_updated_at", "dlvryupdate"],
                  ["delivery_updated_by", "dlvryupdateby"],
                  ["discharge_route_id", "drouteid"],
                  ["discharged_updated_at", "dischupdate"],
                  ["discharged_updated_by", "dischupdateby"],
                  ["loading_date_from", "loadfrom"],
                  ["logistic_offer_id", "lOfferid"],
                  ["logistic_transaction_id", "lTrnsId"],
                ],
                exclude: [
                  "actual_loading_date",
                  "actual_loading_updated_at",
                  "actual_loading_updated_by",
                  "commodity_offer_id",
                  "delivered_updated_at",
                  "delivered_updated_by",
                  "delivery_updated_at",
                  "delivery_updated_by",
                  "discharge_route_id",
                  "discharged_updated_at",
                  "discharged_updated_by",
                  "loading_date_from",
                  "logistic_offer_id",
                  "logistic_transaction_id",
                ],
              },
            },
          ],
        },
      ],
    });
    console.log(208);
    for (let key in transactions.dataValues.offer.lOffers) {
      console.log(210);
      const files = await db.FILES.findAll({
        where: {
          unique_id:
            transactions.dataValues.offer.lOffers[key].dataValues.lOfferid,
        },
      });
      console.log(216);
      for (let key2 in files) {
        filesInTransaction.push({
          commodity_offer_id:
            transactions.dataValues.offer.dataValues.unique_id,
          logistic_offer_id: files[key2].dataValues.unique_id,
          type: files[key2].dataValues.type,
        });
      }
    }
    console.log(226);
    const filterDuplicateObjectsFiles =
      filterDuplicateObjects(filesInTransaction);
    //check if log offer files is fulfilled then update the transaction
    const isFilesComplete = (files, term) => {
      const requiredFileTypes = constant.FILE_TYPE_NEEDED_MAP[term];

      // Get the types of files present in the given array
      const presentFileTypes = files.map((file) => file.type);

      // Check if all required file types are present in the array
      return requiredFileTypes.every((fileType) =>
        presentFileTypes.includes(fileType)
      );
    };
    console.log(242);
    if (
      !isFilesComplete(
        filterDuplicateObjectsFiles,
        transactions.dataValues.offer.dataValues.terms_of_handover
      )
    ) {
      console.log(249);
      //update documents fulfilled in transaction
      await db.trns.update(
        { documents_fulfilled: false },
        {
          where: {
            id: transactions.dataValues.offer.dataValues.transaction_id,
          },
        }
      );
    } else if (
      isFilesComplete(
        filterDuplicateObjectsFiles,
        transactions.dataValues.offer.dataValues.terms_of_handover
      )
    ) {
      console.log(265);
      await db.trns.update(
        { documents_fulfilled: true },
        {
          where: {
            id: transactions.dataValues.offer.dataValues.transaction_id,
          },
        }
      );
    }
    console.log(275);
    return successResponse(req, res, {
      name: fileName,
      url: fileURL,
      type,
      unique_id,
      filePath,
      prefixURL,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, error.message);
  }
};

export const GetFile = async (req, res) => {
  const { file_type, type, file_name } = req.params;
  let pathPrefix = "";
  if (FILE_TYPE_OFFER.includes(type)) {
    pathPrefix = "files/offer";
  } else if (FILE_TYPE_LOGISTIC.includes(type)) {
    pathPrefix = "files/logistic";
  }

  const filePath = `src/bin/storages/${pathPrefix}/${type}/${file_name}`;

  try {
    const pdfBuffer = fs.readFileSync(
      path.join(__dirname, "..", "..", filePath)
    );
    // Set the response headers
    res.setHeader("Content-Type", "application/pdf");

    res.setHeader("Content-Disposition", `inline; filename="${file_name}"`);

    res.send(pdfBuffer);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const FileDelete = async (req, res) => {
  const { url } = req.body.rq_body;
  const userId = getUserID(req);

  try {
    if (!userId) {
      return errorResponseUnauthorized(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }

    const checkId = await db.FILES.findOne({
      where: {
        url: { [Op.like]: `%${url}%` },
      },
    });
    if (!checkId) {
      return errorResponse(
        req,
        res,
        "file tersebut tidak ditemukan atau sudah dihapus"
      );
    }
    const filePath = `src/bin/storages/${url.split("/").slice(4).join("/")}`;

    fs.unlinkSync(filePath);

    await db.FILES.destroy({
      where: {
        url: { [Op.like]: `%${url}%` },
      },
    });
    return successResponse(req, res, "Delete Success");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

const filterDuplicateObjects = (arr) => {
  const uniqueObjects = [];
  const seenObjects = new Set();

  for (const obj of arr) {
    // Convert the object to a string for easy comparison
    const objString = JSON.stringify(obj);

    if (!seenObjects.has(objString)) {
      seenObjects.add(objString);
      uniqueObjects.push(obj);
    }
  }

  return uniqueObjects;
};
