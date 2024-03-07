import db from "../models/index.js";
import { Op, Sequelize, literal, QueryTypes } from "sequelize";

export const OpenQueryPOOuts = async (poNumber, skuCode, transaction) => {
  const getLineNumber = await OpenQueryGetLineNum(poNumber, skuCode);
  const getPOOuts = (po) => {
    const queryWithSchema = `SELECT * FROM OPENQUERY (TESTDEV,'SELECT
        SUM(PO_DISTRIBUTIONS_ALL.QUANTITY_ORDERED - PO_DISTRIBUTIONS_ALL.QUANTITY_DELIVERED - PO_DISTRIBUTIONS_ALL.QUANTITY_CANCELLED) "QUANTITY_OUTSTANDING"
        FROM APPS.PO_HEADERS_ALL, APPS.PO_LINES_ALL, APPS.PO_DISTRIBUTIONS_ALL
        WHERE PO_HEADERS_ALL.SEGMENT1 = ''${po}''
          AND PO_LINES_ALL.LINE_NUM = ''${getLineNumber[0].line_number || 1}''
          AND PO_DISTRIBUTIONS_ALL.PO_HEADER_ID = PO_HEADERS_ALL.PO_HEADER_ID
          AND PO_LINES_ALL.PO_HEADER_ID = PO_HEADERS_ALL.PO_HEADER_ID')`;

    return queryWithSchema;
  };

  const rawQuery = getPOOuts(poNumber);

  try {
    const results = await db.sequelize.query(rawQuery, {
      type: QueryTypes.SELECT,
      transaction,
    });
    return [true, results];
  } catch (error) {
    console.error(error.message);
    return [false, null];
  }
};

export const OpenQueryPODetails = async (poNumber, lineNumber, transaction) => {
  const getPODetails = (po, line) => {
    const queryWithSchema = `SELECT * FROM OPENQUERY (TESTDEV,'select aps.vendor_name, pha.segment1, pla.line_num, pla.quantity, 
      SUM(pda.quantity_ordered-pda.quantity_delivered-pda.quantity_cancelled) qty_outs,pap.full_name buyer_name, fu.user_name,
      (msi.segment1 || ''.'' || msi.segment2 || ''.'' ||msi.segment3) kode_sku, msi.description nama_sku
      from APPS.po_headers_all pha, APPS.po_lines_all pla, APPS.po_distributions_all pda,
      APPS.ap_suppliers aps, APPS.mtl_system_items msi,APPS.per_all_people_f pap, APPS.fnd_user fu
      where 1=1
      and pha.segment1 = ''${po}''
      and pha.agent_id = pap.person_id
      and fu.employee_id = pap.person_id 
      and pha.po_header_id = pla.po_header_id
      and pla.po_line_id = pda.po_line_id
      and pla.line_num = ''${line}''
      and pha.vendor_id = aps.vendor_id
      and pla.item_id = msi.inventory_item_id
      and msi.organization_id = 101
      group by aps.vendor_Name, pha.segment1,
      pla.line_num, pla.quantity,pap.full_name, fu.user_name,
      (msi.segment1 || ''.'' || msi.segment2 || ''.'' ||msi.segment3), 
      msi.description')`;

    return queryWithSchema;
  };

  const rawQuery = getPODetails(poNumber, lineNumber);

  try {
    const results = await db.sequelize.query(rawQuery, {
      type: QueryTypes.SELECT,
      transaction,
    });
    return [true, results];
  } catch (error) {
    console.error(error.message);
    return false;
  }
};

export const OpenQueryGetLineNum = async (poNumber, skuCode, transaction) => {
  const skuSplit = skuCode.split(".");
  const getPODetails = (po, skucode) => {
    const queryWithSchema = `SELECT * FROM OPENQUERY (TESTDEV,'SELECT APS.VENDOR_NAME, PHA.SEGMENT1, PLA.LINE_NUM, PLA.QUANTITY, 
      SUM(PDA.QUANTITY_ORDERED-PDA.QUANTITY_DELIVERED-PDA.QUANTITY_CANCELLED) QTY_OUTS,
      PLA.LINE_NUM LINE_NUMBER, MSI.DESCRIPTION NAMA_SKU,FU.USER_NAME BUYER_NAME
      FROM APPS.PO_HEADERS_ALL PHA, APPS.PO_LINES_ALL PLA, APPS.PO_DISTRIBUTIONS_ALL PDA,
      APPS.AP_SUPPLIERS APS,APPS.MTL_SYSTEM_ITEMS MSI,APPS.PER_ALL_PEOPLE_F PAP, APPS.FND_USER FU
      WHERE 1=1
      AND PHA.SEGMENT1 = ''${po}''
      AND PHA.PO_HEADER_ID = PLA.PO_HEADER_ID
      AND PLA.PO_LINE_ID = PDA.PO_LINE_ID
      AND MSI.SEGMENT1 = ''PKT''
      AND MSI.SEGMENT2 = ''${skucode[1]}''
      AND MSI.SEGMENT3 = ''${skucode[2]}''
      AND PHA.VENDOR_ID = APS.VENDOR_ID
      AND PLA.ITEM_ID = MSI.INVENTORY_ITEM_ID
      AND MSI.ORGANIZATION_ID = 101
      AND PHA.AGENT_ID = PAP.PERSON_ID
      AND FU.EMPLOYEE_ID = PAP.PERSON_ID 
      GROUP BY APS.VENDOR_NAME, PHA.SEGMENT1,
      PLA.LINE_NUM, PLA.QUANTITY,
      (MSI.SEGMENT1 || ''.'' || MSI.SEGMENT2 || ''.'' ||MSI.SEGMENT3), 
      MSI.DESCRIPTION,FU.USER_NAME')`;

    return queryWithSchema;
  };

  const rawQuery = getPODetails(poNumber, skuSplit);

  try {
    const results = await db.sequelize.query(rawQuery, {
      type: QueryTypes.SELECT,
      transaction,
    });
    return [true, results];
  } catch (error) {
    console.error(error.message);
    return [false, null];
  }
};
