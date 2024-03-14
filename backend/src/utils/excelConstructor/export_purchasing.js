import { parsingDateToString, parsingDateToIndoFormat } from "../parsing.js";
import moment from "moment";
const columnMapping = {
  "Tgl Pengajuan": 1,
  Day: 2,
  "Nama Supplier": 3,
  "NO BPA": 4,
  Kontrak: 5,
  PERIODE: 6,
  WEEK: 7,
  Insurance: 8,
  Freight: 9,
  Susut: 10,
  COF: 11,
  Darat: 12,
  "Price All In": 13,
  "QTY (kg)": 14,
  "Price All in Value": 15,
  "Price Incld": 16,
  "Price Incld Value": 17,
  "KPB Equivalent": 18,
  "KPB Value": 19,
  Discharge: 20,
  ETA: 21,
  "FFA CONTRACT": 22,
  "FFA VALUE": 23,
  "Terms of Handover": 24,
  TRADER: 25,
  "LOADING PORT": 26,
  "DISCH. PORT": 27,
  DUMMY: 28,
  "CONFIRMED DELIVERY": 29,
  "TGL REALISASI DELIVERY": 30,
  "QTY REALISASI (BL)": 31,
  "TGL BAST MUAT": 32,
  "TGL MULAI MUAT": 33,
  "TGL SELESAI MUAT": 34,
  "WAKTU KEGIATAN MUAT": 35,
  "QTY BAST MUAT": 36,
};

const budgetFreightColumnMapping = {
  1: 1,
  2: "No",
  3: "Loading Port",
  4: "Discharging Port",
  5: "Dummy",
  6: "Budget Freight",
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  11: "No",
  12: "Port",
  13: "Plant",
  14: "RUTE ANGKUTAN",
  15: "Budget Freight",
};

const monthMapping = {
  "01": "January",
  "02": "February",
  "03": "March",
  "04": "April",
  "05": "May",
  "06": "June",
  "07": "July",
  "08": "August",
  "09": "September",
  10: "October",
  11: "November",
  12: "December",
};

export const ConstructHeaderPPIC = async (ws, styles) => {
  let sheetOffer = ws;

  ///////////////////////////////KOLOM OFFER DETAIL////////////////////////////////////////
  sheetOffer.column(1).setWidth(210 / 12);
  sheetOffer.column(2).setWidth(359 / 12);
  sheetOffer.column(3).setWidth(173 / 12);
  sheetOffer.column(4).setWidth(180 / 12);
  sheetOffer.column(5).setWidth(191 / 12);
  sheetOffer.column(6).setWidth(205 / 12);
  sheetOffer.column(7).setWidth(583 / 12);
  sheetOffer.column(8).setWidth(229 / 12);
  sheetOffer.column(9).setWidth(215 / 12);
  sheetOffer.column(10).setWidth(79 / 12);
  sheetOffer.column(11).setWidth(183 / 12);
  sheetOffer.column(12).setWidth(79 / 12);
  sheetOffer.column(13).setWidth(183 / 12);
  sheetOffer.column(14).setWidth(460 / 12);

  sheetOffer.column(15).setWidth(460 / 12);
  sheetOffer.column(16).setWidth(95 / 12);
  sheetOffer.column(17).setWidth(135 / 12);
  sheetOffer.column(18).setWidth(106 / 12);
  sheetOffer.column(19).setWidth(131 / 12);
  sheetOffer.column(20).setWidth(85 / 12);
  sheetOffer.column(21).setWidth(73 / 12);
  sheetOffer.column(22).setWidth(80 / 12);
  sheetOffer.column(23).setWidth(80 / 12);
  sheetOffer.column(24).setWidth(149 / 12);
  sheetOffer.column(25).setWidth(74 / 12);

  ///////////////////////////////KOLOM LOADING/DISCHARGE PORT KAPAL////////////////////////////////////////
  sheetOffer.column(26).setWidth(118 / 8);
  sheetOffer.column(27).setWidth(84 / 8);
  sheetOffer.column(28).setWidth(185 / 8);
  sheetOffer.column(29).setWidth(80 / 8);
  sheetOffer.column(30).setWidth(111 / 8);
  sheetOffer.column(31).setWidth(64 / 8);
  sheetOffer.column(32).setWidth(80 / 8);
  sheetOffer.column(33).setWidth(98 / 8);
  sheetOffer.column(34).setWidth(91 / 8);
  sheetOffer.column(35).setWidth(95 / 8);

  ///////////////////////////////KOLOM SUPPLIER KAPAL////////////////////////////////////////
  sheetOffer.column(36).setWidth(64 / 8);
  sheetOffer.column(37).setWidth(193 / 8);
  sheetOffer.column(38).setWidth(259 / 8);
  sheetOffer.column(39).setWidth(80 / 8);
  sheetOffer.column(40).setWidth(80 / 8);

  ///////////////////////////////KOLOM BUDGET TRUCKING KAPAL////////////////////////////////////////
  sheetOffer.column(41).setWidth(91 / 8);
  sheetOffer.column(42).setWidth(80 / 8);
  sheetOffer.column(43).setWidth(80 / 8);

  sheetOffer.row(1).setHeight(53.5);

  sheetOffer
    .cell(1, 1, 2, 1, true)
    .string("Tgl Pengajuan")
    .style(styles.CustomTableHeadOfferDetail?.Bordered);
  sheetOffer
    .cell(1, 2, 2, 2, true)
    .string("Nama Supplier")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 3, 2, 3, true)
    .string("No PR/PO")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 4, 2, 4, true)
    .string("Qty PR/PO")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 5, 2, 5, true)
    .string("Outs PR/PO")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 6, 2, 6, true)
    .string("SKU Code")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 7, 2, 7, true)
    .string("SKU Name")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 8, 2, 8, true)
    .string("Qty Pengiriman")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 9, 2, 9, true)
    .string("Rencana Kirim")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 10, 1, 11, true)
    .string("Revisi")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(2, 10)
    .string("Qty")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(2, 11)
    .string("Tanggal")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 12, 1, 13, true)
    .string("Konfirmasi Supp")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(2, 12)
    .string("Qty")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(2, 13)
    .string("Tanggal")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 14, 2, 14, true)
    .string("Ket")
    .style(styles.CustomTableHeadOfferDetail.Bordered);

  return sheetOffer;
};
export const ConstructBodyPPIC = async (ws, styles, offers) => {
  const sheetOffer = ws;
  const startRow = 3;
  for (let row = startRow; row < offers.length + startRow; row++) {
    let offersLoop = offers[row - startRow];

    for (let col = 1; col <= 12; col++) {
      //colA
      if (col == 1) {
        sheetOffer
          .cell(row, col)
          .string(`${moment(offersLoop.submission_date).format("DD/MM/YYYY")}`)
          .style(styles.Number.Plain);
      }
      //colB
      if (col == 2) {
        sheetOffer
          .cell(row, col)
          .string(`${offersLoop.supplier.name}`)
          .style(styles.Number.Plain);
      }
      //colC

      if (col == 3) {
        sheetOffer
          .cell(row, col)
          .string(`${offersLoop.po_number}`)
          .style(styles.Number.Plain);
      }
      //colD
      if (col == 4) {
        sheetOffer
          .cell(row, col)
          .string(`${offersLoop.po_qty}`)
          .style(styles.Number.Plain);
      }
      //colE
      if (col == 5) {
        sheetOffer
          .cell(row, col)
          .string(`${offersLoop.po_outs}`)
          .style(styles.Number.Plain);
      }
      //colF
      if (col == 6) {
        sheetOffer
          .cell(row, col)
          .string(`${offersLoop.sku_code}`)
          .style(styles.Number.Plain);
      }
      //colG
      if (col == 7) {
        sheetOffer
          .cell(row, col)
          .string(`${offersLoop.sku_name}`)
          .style(styles.Number.Plain);
      }
      //colH
      if (col == 8) {
        sheetOffer
          .cell(row, col)
          .string(`${offersLoop.qty_delivery}`)
          .style(styles.Number.Plain);
      }
      //colI
      if (col == 9) {
        sheetOffer
          .cell(row, col)
          .string(`${moment(offersLoop.est_delivery).format("DD/MM/YYYY")}`)
          .style(styles.Number.Plain);
      }
      //colJ
      if (col == 10) {
        sheetOffer
          .cell(row, col)
          .string(`${offersLoop.revised_qty ?? ""}`)
          .style(styles.Number.Plain);
      }
      //colK
      if (col == 11) {
        sheetOffer
          .cell(row, col)
          .string(
            `${
              !offersLoop.revised_date
                ? ""
                : moment(offersLoop.revised_date).format("DD/MM/YYYY")
            }`
          )
          .style(styles.Number.Plain);
      }
      //colL
      if (col == 12) {
        sheetOffer
          .cell(row, col)
          .string(
            `${!offersLoop.submitted_qty ? "" : offersLoop.submitted_qty}`
          )
          .style(styles.Number.Plain);
      }
      //colM
      if (col == 13) {
        sheetOffer
          .cell(row, col)
          .string(
            `${moment(offersLoop.est_submitted_date).format("DD/MM/YYYY")}`
          )
          .style(styles.Number.Plain);
      }
      //colM
      if (col == 14) {
        sheetOffer
          .cell(row, col)
          .string(`${JSON.parse(offersLoop.notes)?.init?.notes ?? ""}`)
          .style(styles.Number.Plain);
      }
    }
  }
  return sheetOffer;
};

export const ConstructHeaderPurchasing = async (ws, styles) => {
  let sheetOffer = ws;

  ///////////////////////////////KOLOM OFFER DETAIL////////////////////////////////////////
  sheetOffer.column(1).setWidth(210 / 12);
  sheetOffer.column(2).setWidth(359 / 12);
  sheetOffer.column(3).setWidth(173 / 12);
  sheetOffer.column(4).setWidth(180 / 12);
  sheetOffer.column(5).setWidth(191 / 12);
  sheetOffer.column(6).setWidth(205 / 12);
  sheetOffer.column(7).setWidth(583 / 12);
  sheetOffer.column(8).setWidth(229 / 12);
  sheetOffer.column(9).setWidth(215 / 12);
  sheetOffer.column(10).setWidth(79 / 12);
  sheetOffer.column(11).setWidth(183 / 12);
  sheetOffer.column(12).setWidth(79 / 12);
  sheetOffer.column(13).setWidth(183 / 12);
  sheetOffer.column(14).setWidth(460 / 12);

  sheetOffer.column(15).setWidth(460 / 12);
  sheetOffer.column(16).setWidth(95 / 12);
  sheetOffer.column(17).setWidth(135 / 12);
  sheetOffer.column(18).setWidth(106 / 12);
  sheetOffer.column(19).setWidth(131 / 12);
  sheetOffer.column(20).setWidth(85 / 12);
  sheetOffer.column(21).setWidth(73 / 12);
  sheetOffer.column(22).setWidth(80 / 12);
  sheetOffer.column(23).setWidth(80 / 12);
  sheetOffer.column(24).setWidth(149 / 12);
  sheetOffer.column(25).setWidth(74 / 12);

  ///////////////////////////////KOLOM LOADING/DISCHARGE PORT KAPAL////////////////////////////////////////
  sheetOffer.column(26).setWidth(118 / 8);
  sheetOffer.column(27).setWidth(84 / 8);
  sheetOffer.column(28).setWidth(185 / 8);
  sheetOffer.column(29).setWidth(80 / 8);
  sheetOffer.column(30).setWidth(111 / 8);
  sheetOffer.column(31).setWidth(64 / 8);
  sheetOffer.column(32).setWidth(80 / 8);
  sheetOffer.column(33).setWidth(98 / 8);
  sheetOffer.column(34).setWidth(91 / 8);
  sheetOffer.column(35).setWidth(95 / 8);

  ///////////////////////////////KOLOM SUPPLIER KAPAL////////////////////////////////////////
  sheetOffer.column(36).setWidth(64 / 8);
  sheetOffer.column(37).setWidth(193 / 8);
  sheetOffer.column(38).setWidth(259 / 8);
  sheetOffer.column(39).setWidth(80 / 8);
  sheetOffer.column(40).setWidth(80 / 8);

  ///////////////////////////////KOLOM BUDGET TRUCKING KAPAL////////////////////////////////////////
  sheetOffer.column(41).setWidth(91 / 8);
  sheetOffer.column(42).setWidth(80 / 8);
  sheetOffer.column(43).setWidth(80 / 8);

  sheetOffer.row(1).setHeight(53.5);

  sheetOffer
    .cell(1, 1, 2, 1, true)
    .string("Tgl Pengajuan")
    .style(styles.CustomTableHeadOfferDetail?.Bordered);
  sheetOffer
    .cell(1, 2, 2, 2, true)
    .string("Nama Supplier")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 3, 2, 3, true)
    .string("No PR/PO")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 4, 2, 4, true)
    .string("Qty PR/PO")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 5, 2, 5, true)
    .string("Outs PR/PO")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 6, 2, 6, true)
    .string("SKU Code")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 7, 2, 7, true)
    .string("SKU Name")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 8, 2, 8, true)
    .string("Qty Pengiriman")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 9, 2, 9, true)
    .string("Rencana Kirim")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 10, 1, 11, true)
    .string("Revisi")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(2, 10)
    .string("Qty")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(2, 11)
    .string("Tanggal")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 12, 1, 13, true)
    .string("Konfirmasi Supp")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(2, 12)
    .string("Qty")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(2, 13)
    .string("Tanggal")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 14, 2, 14, true)
    .string("Ket")
    .style(styles.CustomTableHeadOfferDetail.Bordered);

  return sheetOffer;
};
export const ConstructBodyPurchasing = async (ws, styles, offers) => {
  const sheetOffer = ws;
  const startRow = 3;
  for (let row = startRow; row < offers.length + startRow; row++) {
    let offersLoop = offers[row - startRow];

    for (let col = 1; col <= 12; col++) {
      //colA
      if (col == 1) {
        sheetOffer
          .cell(row, col)
          .string(`${moment(offersLoop.submission_date).format("DD/MM/YYYY")}`)
          .style(styles.Number.Plain);
      }
      //colB
      if (col == 2) {
        sheetOffer
          .cell(row, col)
          .string(`${offersLoop.supplier.name}`)
          .style(styles.Number.Plain);
      }
      //colC

      if (col == 3) {
        sheetOffer
          .cell(row, col)
          .string(`${offersLoop.po_number}`)
          .style(styles.Number.Plain);
      }
      //colD
      if (col == 4) {
        sheetOffer
          .cell(row, col)
          .string(`${offersLoop.po_qty}`)
          .style(styles.Number.Plain);
      }
      //colE
      if (col == 5) {
        sheetOffer
          .cell(row, col)
          .string(`${offersLoop.po_outs}`)
          .style(styles.Number.Plain);
      }
      //colF
      if (col == 6) {
        sheetOffer
          .cell(row, col)
          .string(`${offersLoop.sku_code}`)
          .style(styles.Number.Plain);
      }
      //colG
      if (col == 7) {
        sheetOffer
          .cell(row, col)
          .string(`${offersLoop.sku_name}`)
          .style(styles.Number.Plain);
      }
      //colH
      if (col == 8) {
        sheetOffer
          .cell(row, col)
          .string(`${offersLoop.qty_delivery}`)
          .style(styles.Number.Plain);
      }
      //colI
      if (col == 9) {
        sheetOffer
          .cell(row, col)
          .string(`${moment(offersLoop.est_delivery).format("DD/MM/YYYY")}`)
          .style(styles.Number.Plain);
      }
      //colJ
      if (col == 10) {
        sheetOffer
          .cell(row, col)
          .string(`${offersLoop.revised_qty ?? ""}`)
          .style(styles.Number.Plain);
      }
      //colK
      if (col == 11) {
        sheetOffer
          .cell(row, col)
          .string(
            `${
              !offersLoop.revised_date
                ? ""
                : moment(offersLoop.revised_date).format("DD/MM/YYYY")
            }`
          )
          .style(styles.Number.Plain);
      }
      //colL
      if (col == 12) {
        sheetOffer
          .cell(row, col)
          .string(
            `${!offersLoop.submitted_qty ? "" : offersLoop.submitted_qty}`
          )
          .style(styles.Number.Plain);
      }
      //colM
      if (col == 13) {
        sheetOffer
          .cell(row, col)
          .string(
            `${moment(offersLoop.est_submitted_date).format("DD/MM/YYYY")}`
          )
          .style(styles.Number.Plain);
      }
      //colM
      if (col == 14) {
        sheetOffer
          .cell(row, col)
          .string(`${JSON.parse(offersLoop.notes)?.init?.notes ?? ""}`)
          .style(styles.Number.Plain);
      }
    }
  }
  return sheetOffer;
};
