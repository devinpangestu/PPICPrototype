import fs from "fs";
import db from "../models/index.js";

export const isFileLocked = (filePath, callback) => {
  // Attempt to open the file in write mode with exclusive flag (O_EXCL).
  fs.open(filePath, "w", 0x200, (err, fd) => {
    if (err) {
      if (err.code === "EEXIST") {
        // The file is locked.
        callback(null, true);
      } else {
        // An error occurred while attempting to open the file.
        callback(err, false);
      }
    } else {
      // The file is not locked.
      fs.close(fd, (closeErr) => {
        if (closeErr) {
          callback(closeErr, false);
        } else {
          callback(null, false);
        }
      });
    }
  });
};

export const getOutsQtyEachPOSKU = async (po_number, sku_code) => {
  const dataPOQty = await db.OFFERS.findOne({
    attributes: ["po_qty"],
    where: {
      po_number,
      sku_code,
      deleted_at: null,
    },
  });
  const data = await db.OFFERS.findAll({
    where: {
      po_number,
      sku_code,
      deleted_at: null,
    },
  });
  const poQty = parseInt(dataPOQty?.dataValues.po_qty) || 0;

  const deliveredQty = data.reduce((total, obj) => {
    const qtyToUse =
      obj.revised_qty !== null ? obj.revised_qty : obj.qty_delivery || 0;
    return total + Number(qtyToUse);
  }, 0);

  return poQty - deliveredQty;
};
