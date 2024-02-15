import xl from "excel4node";
import db from "../../models/index.js";
import { constant } from "../../constant/index.js";
import { Op } from "sequelize";
import {
  parsingDateToString,
  parsingStringToDateEarly,
  parsingStringToDateLate,
} from "../parsing.js";
import { toExportTransactionAPIStruct } from "../apiStruct/transactions.js";
import { ConstructHeaderHistory } from "../excelConstructor/export_history.js";
import { compare } from "mathjs";
import { count } from "console";

const columnMapping = {
  No: 1,
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

export const exportTrnHist = async (ws, styles, fromDate, toDate) => {
  let sheetOffer = ws;
  const filter = {
    fromDate,
    toDate,
    pageSize: constant.UNLIMITED_PAGE_SIZE,
  };

  const offers = await TransactionsList(db, filter);

  return await writeTransactionHistory(sheetOffer, styles, offers);
};

const writeTransactionHistory = async (ws, styles, offers) => {
  /////////////////////////OPSI 1////////////////////////////

  //   let sheetOffer = ws;
  //   sheetOffer = await ConstructHeaderHistory(sheetOffer, styles);

  //   const startRow = 2;

  //   let addRowEveryTransportirInOneOffer = 0;
  //   let countingRowLoop = 0;
  //   for (let key in offers) {
  //     // console.log(
  //     //   offers[key].Offer.offer.logistic_offers.length,
  //     //   "panjang array logistic tiap offer"
  //     // );
  //     // console.log(offers[key].Offer.offer.terms_of_handover);
  //     if (
  //       offers[key].Offer.offer.logistic_offers.length == 0 ||
  //       offers[key].Offer.offer.logistic_offers.length == 1
  //     ) {
  //     } else {
  //       addRowEveryTransportirInOneOffer +=
  //         offers[key].Offer.offer.logistic_offers.length - 1;
  //     }
  //   }
  //   // console.log(
  //   //   addRowEveryTransportirInOneOffer,
  //   //   "addRowEveryTransportirInOneOffer "
  //   // );
  //   // console.log(
  //   //   "LOOPING AKAN DIMULAI SEBANYAK",
  //   //   offers.length + addRowEveryTransportirInOneOffer
  //   // );
  //   let countLogisticOfferArray = 0;
  //   // console.log(
  //   //   "TOTAL AKHIR ROW EXCEL SEHARUSNYA",
  //   //   offers.length + startRow + addRowEveryTransportirInOneOffer
  //   // );
  //   for (
  //     let row = startRow;
  //     row < offers.length + startRow + addRowEveryTransportirInOneOffer;
  //     row++
  //   ) {
  //     let counterMundur =
  //       offers[row - startRow - countingRowLoop].Offer.offer.logistic_offers
  //         .length;
  //     countLogisticOfferArray++;

  //     for (let col = 1; col <= Object.keys(columnMapping).length; col++) {
  //       //1. No

  //       // console.log("MULAI ISI ROW ", row - startRow + 2);
  //       // console.log("SEKARANG OFFER ARRAY KE", row - startRow - countingRowLoop);
  //       // console.log(
  //       //   "PANJANG LOGISTIC ARRAY PADA OFFER ARRAY KE",
  //       //   row - startRow - countingRowLoop,
  //       //   "ADALAH",
  //       //   offers[row - startRow - countingRowLoop].Offer.offer.logistic_offers
  //       //     .length
  //       // );
  //       // console.log(
  //       //   "START LOOPING OFFER ARRAY KE ",
  //       //   row - startRow - countingRowLoop,
  //       //   " DAN LOGISTIC OFFER ARRAY KE ",
  //       //   countLogisticOfferArray - 1
  //       // );
  //       if (col == 1) {
  //         // console.log("colA");
  //         //kalo masih di offer yang sama then add S string for duplicate offer but different logistic
  //         sheetOffer
  //           .cell(row, col)
  //           .string(
  //             `${row - startRow - countingRowLoop + 1}${
  //               counterMundur > 1 ? "S".repeat(countLogisticOfferArray - 1) : ""
  //             }`
  //           )
  //           .style(styles.Number.Plain);
  //       }
  //       //2. Day
  //       if (col == 2) {
  //         // console.log("colB");
  //         sheetOffer
  //           .cell(row, col)
  //           .string(
  //             `${
  //               parsingDateToString(
  //                 offers[row - startRow - countingRowLoop].Offer.offer.datetime
  //               ).split("-")[2] +
  //               " " +
  //               monthMapping[
  //                 parsingDateToString(
  //                   offers[row - startRow - countingRowLoop].Offer.offer.datetime
  //                 ).split("-")[1]
  //               ] +
  //               " " +
  //               parsingDateToString(
  //                 offers[row - startRow - countingRowLoop].Offer.offer.datetime
  //               ).split("-")[0]
  //             }`
  //           )
  //           .style(styles.Date.Plain);
  //       }
  //       //3. Nama Supplier
  //       if (col == 3) {
  //         // console.log("colC");
  //         sheetOffer
  //           .cell(row, col)
  //           .string(
  //             `${
  //               !offers[row - startRow - countingRowLoop].Offer.offer.supplier
  //                 .name
  //                 ? ""
  //                 : offers[row - startRow - countingRowLoop].Offer.offer.supplier
  //                     .name
  //             }`
  //           )
  //           .style(styles.String.Plain);
  //       }
  //       //4. NO BPA
  //       if (col == 4) {
  //         // console.log("colD");
  //         sheetOffer
  //           .cell(row, col)
  //           .string(
  //             `${
  //               !offers[row - startRow - countingRowLoop].Offer.offer.id
  //                 ? ""
  //                 : offers[row - startRow - countingRowLoop].Offer.offer.id
  //             }`
  //           )
  //           .style(styles.String.Plain);
  //       }
  //       //5. Kontrak
  //       if (col == 5) {
  //         // console.log("colE");
  //         sheetOffer
  //           .cell(row, col)
  //           .string(
  //             `${
  //               !offers[row - startRow - countingRowLoop].Offer.offer.commodity
  //                 .name
  //                 ? ""
  //                 : offers[row - startRow - countingRowLoop].Offer.offer.commodity
  //                     .name
  //             }`
  //           )
  //           .style(styles.String.Plain);
  //       }
  //       //6. PERIODE
  //       if (col == 6) {
  //         // console.log("colF");
  //         sheetOffer
  //           .cell(row, col)
  //           .string(
  //             `${
  //               monthMapping[
  //                 parsingDateToString(
  //                   offers[row - startRow - countingRowLoop].Offer.offer.datetime
  //                 ).split("-")[1]
  //               ] +
  //               " " +
  //               parsingDateToString(
  //                 offers[row - startRow - countingRowLoop].Offer.offer.datetime
  //               ).split("-")[0]
  //               // !offers[row - startRow - countingRowLoop].Offer.offer.warehouse
  //               //   .name
  //               //   ? ""
  //               //   : offers[row - startRow - countingRowLoop].Offer.offer.warehouse
  //               //       .name
  //             }`
  //           )
  //           .style(styles.String.Plain);
  //       }
  //       //7. WEEK
  //       if (col == 7) {
  //         // console.log("col G");
  //         sheetOffer
  //           .cell(row, col)
  //           .string(
  //             `${
  //               !offers[row - startRow - countingRowLoop].Offer.offer
  //                 .hOver_Loc
  //                 ? ""
  //                 : offers[row - startRow - countingRowLoop].Offer.offer
  //                     .hOver_Loc.name
  //             }`
  //           )
  //           .style(styles.String.Plain);
  //       }
  //       //8. Insurance
  //       if (col == 8) {
  //         // console.log("colH");
  //         sheetOffer
  //           .cell(row, col)
  //           .number(
  //             parseInt(
  //               `${
  //                 !offers[row - startRow - countingRowLoop].Offer.offer
  //                   .price_insurance
  //                   ? 0
  //                   : offers[row - startRow - countingRowLoop].Offer.offer
  //                       .price_insurance
  //               }`
  //             )
  //           )
  //           .style(styles.Number.Plain);
  //       }
  //       //9. Freight
  //       if (col == 9) {
  //         // console.log("colI");

  //         sheetOffer
  //           .cell(row, col)
  //           .number(
  //             parseInt(
  //               `${
  //                 !offers[row - startRow - countingRowLoop].Offer.offer
  //                   .price_freight
  //                   ? 0
  //                   : offers[row - startRow - countingRowLoop].Offer.offer
  //                       .price_freight
  //               }`
  //             )
  //           )
  //           .style(styles.Number.Plain);
  //       }
  //       //10. Susut
  //       if (col == 10) {
  //         // console.log("colJ");
  //         sheetOffer
  //           .cell(row, col)
  //           .number(
  //             parseInt(
  //               `${
  //                 !offers[row - startRow - countingRowLoop].Offer.offer
  //                   .price_susut
  //                   ? 0
  //                   : offers[row - startRow - countingRowLoop].Offer.offer
  //                       .price_susut
  //               }`
  //             )
  //           )
  //           .style(styles.Number.Plain);
  //       }
  //       //11. COF
  //       if (col == 11) {
  //         // console.log("colK");
  //         sheetOffer
  //           .cell(row, col)
  //           .number(
  //             parseInt(
  //               `${
  //                 !offers[row - startRow - countingRowLoop].Offer.offer.price_cof
  //                   ? 0
  //                   : offers[row - startRow - countingRowLoop].Offer.offer
  //                       .price_cof
  //               }`
  //             )
  //           )
  //           .style(styles.Number.Plain);
  //       }
  //       //12. Darat
  //       if (col == 12) {
  //         // console.log("colL");

  //         sheetOffer
  //           .cell(row, col)
  //           .number(
  //             parseInt(
  //               `${
  //                 !offers[row - startRow - countingRowLoop].Offer.offer
  //                   .price_final
  //                   ? 0
  //                   : offers[row - startRow - countingRowLoop].Offer.offer
  //                       .price_final
  //               }`
  //             )
  //           )
  //           .style(styles.Number.Plain);
  //       }
  //       //13. Price All In
  //       if (col == 13) {
  //         // console.log("colM");

  //         let formula = `P${row}+SUM(H${row}:L${row})`;
  //         sheetOffer.cell(row, col).formula(formula).style(styles.Price.Plain);
  //       }
  //       //14. QTY (kg)

  //       if (col == 14) {
  //         // console.log("colN");

  //         sheetOffer
  //           .cell(row, col)
  //           .number(
  //             parseInt(
  //               `${
  //                 offers[row - startRow - countingRowLoop].Offer.offer
  //                   .logistic_offers.length == 0
  //                   ? offers[row - startRow - countingRowLoop].Offer.offer
  //                       .terms_of_handover == "franco"
  //                     ? offers[row - startRow - countingRowLoop].Offer.offer
  //                         .quantity
  //                     : 0
  //                   : offers[row - startRow - countingRowLoop].Offer.offer
  //                       .logistic_offers[countLogisticOfferArray - 1].quantity

  //               }`
  //             ) * 1000
  //           )
  //           .style(styles.Numeric.Plain);
  //       }
  //       //15. Price All in Value
  //       if (col == 15) {
  //         // console.log("colO");
  //         let formula = `M${row}*N${row}`;
  //         // console.log(formula);
  //         sheetOffer.cell(row, col).formula(formula).style(styles.Price.Plain);
  //       }
  //       //16. Price Incld
  //       if (col == 16) {
  //         // console.log("colP");
  //         sheetOffer
  //           .cell(row, col)
  //           .number(
  //             parseInt(
  //               `${
  //                 !offers[row - startRow - countingRowLoop].Offer.offer
  //                   .price_final
  //                   ? 0
  //                   : offers[row - startRow - countingRowLoop].Offer.offer
  //                       .price_final
  //               }`
  //             )
  //           )
  //           .style(styles.Price.Plain);
  //       }
  //       //17. Price Incld Value
  //       if (col == 17) {
  //         // console.log("colQ");
  //         let formula = `P${row}*N${row}`;
  //         sheetOffer.cell(row, col).formula(formula).style(styles.Price.Plain);
  //       }
  //       //18. KPB Equivalent
  //       if (col == 18) {
  //         // console.log("colR");
  //         sheetOffer
  //           .cell(row, col)
  //           .number(
  //             parseInt(
  //               `${
  //                 !offers[row - startRow - countingRowLoop].Offer.offer
  //                   .price_final
  //                   ? 0
  //                   : offers[row - startRow - countingRowLoop].Offer.offer
  //                       .price_final
  //               }`
  //             )
  //           )
  //           .style(styles.Price.Plain);
  //       }
  //       //19. KPB Value
  //       if (col == 19) {
  //         // console.log("colS");
  //         sheetOffer
  //           .cell(row, col)
  //           .number(
  //             parseInt(
  //               `${
  //                 !offers[row - startRow - countingRowLoop].Offer.offer
  //                   .price_final
  //                   ? 0
  //                   : offers[row - startRow - countingRowLoop].Offer.offer
  //                       .price_final
  //               }`
  //             )
  //           )
  //           .style(styles.Price.Plain);
  //       }
  //       //20. Discharge

  //       if (col == 20) {
  //         // console.log("colT");
  //         sheetOffer
  //           .cell(row, col)
  //           .string(
  //             `${
  //               !offers[row - startRow - countingRowLoop].Offer.offer.price_final
  //                 ? 0
  //                 : offers[row - startRow - countingRowLoop].Offer.offer
  //                     .price_final
  //             }`
  //           )
  //           .style(styles.String.Plain);
  //       }
  //       //21. ETA
  //       if (col == 21) {
  //         // console.log("colU");
  //         sheetOffer
  //           .cell(row, col)
  //           .string(
  //             `${
  //               !offers[row - startRow - countingRowLoop].Offer.offer.price_final
  //                 ? 0
  //                 : offers[row - startRow - countingRowLoop].Offer.offer
  //                     .price_final
  //             }`
  //           )
  //           .style(styles.String.Plain);
  //       }
  //       //22. FFA CONTRACT
  //       if (col == 22) {
  //         // console.log("colV");
  //         sheetOffer
  //           .cell(row, col)
  //           .number(
  //             parseInt(
  //               `${
  //                 offers[row - startRow - countingRowLoop].Offer.offer.quality_ffa
  //               }`
  //             )
  //           )
  //           .style(styles.Numeric.Plain);
  //       }
  //       //23. FFA VALUE
  //       if (col == 23) {
  //         // console.log("colW");
  //         let formula = `V${row}*N${row}`;
  //         sheetOffer.cell(row, col).formula(formula).style(styles.String.Plain);
  //       }
  //       //24. Terms of Handover
  //       if (col == 24) {
  //         // console.log("colX");
  //         sheetOffer
  //           .cell(row, col)
  //           .string(
  //             `${
  //               offers[row - startRow - countingRowLoop].Offer.offer
  //                 .terms_of_handover
  //             }`
  //           )
  //           .style(styles.String.Plain);
  //       }
  //       //25. TRADER
  //       if (col == 25) {
  //         // console.log("colY");
  //         let firstName =
  //           offers[row - startRow - countingRowLoop].Offer.offer.dealer.name
  //             .length > 1
  //             ? offers[
  //                 row - startRow - countingRowLoop
  //               ].Offer.offer.dealer.name.split(" ")[0]
  //             : offers[row - startRow - countingRowLoop].Offer.offer.dealer.name;

  //         sheetOffer.cell(row, col).string(firstName).style(styles.String.Plain);
  //       }
  //     }

  //     // console.log(
  //     //   "END LOOPING OFFER ARRAY KE ",
  //     //   row - startRow - countingRowLoop,
  //     //   " DAN LOGISTIC OFFER ARRAY KE ",
  //     //   countLogisticOfferArray - 1
  //     // );

  //     counterMundur--;

  //     if (
  //       offers[row - startRow - countingRowLoop].Offer.offer.logistic_offers
  //         .length == 0 ||
  //       offers[row - startRow - countingRowLoop].Offer.offer.logistic_offers
  //         .length == 1
  //     ) {
  //       countLogisticOfferArray = 0;
  //     } else {
  //       // console.log(
  //       //   offers[row - startRow - countingRowLoop].Offer.offer.logistic_offers
  //       //     .length,
  //       //   "KOK YANG INI ANEH"
  //       // );

  //       if (
  //         offers[row - startRow - countingRowLoop].Offer.offer.logistic_offers
  //           .length == countLogisticOfferArray
  //       ) {
  //         countLogisticOfferArray = 0;
  //         countingRowLoop--;
  //         // console.log("masuk sini");
  //         // console.log(
  //         //   "SEKARANG ARRAY KE",
  //         //   row - startRow - countingRowLoop,
  //         //   " PANJANG ARRAYNYA",
  //         //   offers[row - startRow - countingRowLoop].Offer.offer.logistic_offers
  //         //     .length,
  //         //   "DAN COUNTNYA",
  //         //   countLogisticOfferArray
  //         // );
  //         // console.log("masuk sini2");
  //         // console.log(
  //         //   offers[row - startRow - countingRowLoop].Offer.offer.logistic_offers
  //         //     .length == countLogisticOfferArray,
  //         //   "KONDISI TRUE/FALSE",
  //         //   offers[row - startRow - countingRowLoop].Offer.offer.logistic_offers
  //         //     .length,
  //         //   "==",
  //         //   countLogisticOfferArray
  //         // );
  //         // console.log("masuk sini3");
  //       }

  //       // if (
  //       //   offers[row - startRow - countingRowLoop].Offer.offer.logistic_offers
  //       //     .length == countLogisticOfferArray
  //       // ) {
  //       //   if (counterMundur == 0) {
  //       //     countLogisticOfferArray = 0;
  //       //   }
  //       // }

  //       countingRowLoop++;
  //       // console.log(`${countingRowLoop} countingRowLoop`);
  //       // console.log(`${countLogisticOfferArray} countLogisticOfferArray`);
  //     }

  //     // console.log(`complete row ${row}`);
  //   }

  //   return sheetOffer;

  /////////////////////////////OPSI 2//////////////////////////////////////

  //   let sheetOffer = await ConstructHeaderHistory(ws, styles);
  //   const startRow = 2;

  //   for (let row = startRow, i = 0; i < offers.length; row++, i++) {
  //     let offer = offers[i].Offer.offer;
  //     let logisticOffers = offer.logistic_offers || [];

  //     sheetOffer
  //       .cell(row, 1)
  //       .string(`${i + 1}${logisticOffers.length > 1 ? "S".repeat(i) : ""}`)
  //       .style(styles.Number.Plain);
  //     sheetOffer
  //       .cell(row, 2)
  //       .string(
  //         parsingDateToString(offer.datetime).split("-").reverse().join(" ")
  //       )
  //       .style(styles.Date.Plain);
  //     sheetOffer
  //       .cell(row, 3)
  //       .string(offer.supplier?.name || "")
  //       .style(styles.String.Plain);
  //     sheetOffer
  //       .cell(row, 4)
  //       .string(offer.id || "")
  //       .style(styles.String.Plain);
  //     sheetOffer
  //       .cell(row, 5)
  //       .string(offer.commodity?.name || "")
  //       .style(styles.String.Plain);
  //     sheetOffer
  //       .cell(row, 6)
  //       .string(
  //         monthMapping[offer.datetime.split("-")[1]] +
  //           " " +
  //           offer.datetime.split("-")[0]
  //       )
  //       .style(styles.String.Plain);
  //     sheetOffer
  //       .cell(row, 7)
  //       .string(offer.hOver_Loc?.name || "")
  //       .style(styles.String.Plain);
  //     sheetOffer
  //       .cell(row, 8)
  //       .number(parseInt(offer.price_insurance || 0))
  //       .style(styles.Number.Plain);
  //     sheetOffer
  //       .cell(row, 9)
  //       .number(parseInt(offer.price_freight || 0))
  //       .style(styles.Number.Plain);
  //     sheetOffer
  //       .cell(row, 10)
  //       .number(parseInt(offer.price_susut || 0))
  //       .style(styles.Number.Plain);
  //     sheetOffer
  //       .cell(row, 11)
  //       .number(parseInt(offer.price_cof || 0))
  //       .style(styles.Number.Plain);
  //     sheetOffer
  //       .cell(row, 12)
  //       .number(parseInt(offer.price_final || 0))
  //       .style(styles.Number.Plain);
  //     sheetOffer
  //       .cell(row, 13)
  //       .formula(`P${row}+SUM(H${row}:L${row})`)
  //       .style(styles.Price.Plain);
  //     sheetOffer
  //       .cell(row, 14)
  //       .number(
  //         parseInt(
  //           logisticOffers.length === 0
  //             ? offer.terms_of_handover === "franco"
  //               ? offer.quantity
  //               : 0
  //             : logisticOffers[logisticOffers.length - 1].quantity
  //         ) * 1000
  //       )
  //       .style(styles.Numeric.Plain);
  //     sheetOffer
  //       .cell(row, 15)
  //       .formula(`M${row}*N${row}`)
  //       .style(styles.Price.Plain);
  //     sheetOffer
  //       .cell(row, 16)
  //       .number(parseInt(offer.price_final || 0))
  //       .style(styles.Price.Plain);
  //     sheetOffer
  //       .cell(row, 17)
  //       .formula(`P${row}*N${row}`)
  //       .style(styles.Price.Plain);
  //     sheetOffer
  //       .cell(row, 18)
  //       .number(parseInt(offer.price_final || 0))
  //       .style(styles.Price.Plain);
  //     sheetOffer
  //       .cell(row, 19)
  //       .number(parseInt(offer.price_final || 0))
  //       .style(styles.Price.Plain);
  //     sheetOffer
  //       .cell(row, 20)
  //       .string(offer.price_final || "")
  //       .style(styles.String.Plain);
  //     sheetOffer
  //       .cell(row, 21)
  //       .string(offer.price_final || "")
  //       .style(styles.String.Plain);
  //     sheetOffer
  //       .cell(row, 22)
  //       .number(parseInt(offer.quality_ffa))
  //       .style(styles.Numeric.Plain);
  //     sheetOffer
  //       .cell(row, 23)
  //       .formula(`V${row}*N${row}`)
  //       .style(styles.String.Plain);
  //     sheetOffer
  //       .cell(row, 24)
  //       .string(offer.terms_of_handover)
  //       .style(styles.String.Plain);
  //     sheetOffer
  //       .cell(row, 25)
  //       .string(
  //         (offer.dealer.name.length > 1
  //           ? offer.dealer.name.split(" ")[0]
  //           : offer.dealer.name) || ""
  //       )
  //       .style(styles.String.Plain);
  //   }

  //   return sheetOffer;

  /////////////////////////////OPSI 3//////////////////////////////////////
  let sheetOffer = await ConstructHeaderHistory(ws, styles);
  const startRow = 2;

  for (let row = startRow, i = 0; i < offers.length; row++, i++) {
    let offer = offers[i].Offer.offer;
    let logisticOffers = offer.logistic_offers || [];

    for (let col = 1; col <= Object.keys(columnMapping).length; col++) {
      const columnName = Object.keys(columnMapping).find(
        (key) => columnMapping[key] === col
      );
      const dataType = typeof offer[columnName];
      let cellValue;

      switch (dataType) {
        case "string":
          cellValue = offer[columnName] || "";
          break;
        case "object":
          if (dataType === "object" && offer[columnName]) {
            cellValue = offer[columnName].name || "";
          } else {
            cellValue = "";
          }
          break;
        case "number":
          cellValue = parseInt(offer[columnName] || 0);
          break;
        case "boolean":
          cellValue = offer[columnName] ? "Yes" : "No";
          break;
        case "date":
          cellValue = parsingDateToString(offer[columnName])
            .split("-")
            .reverse()
            .join(" ");
          break;
        default:
          cellValue = "";
      }

      sheetOffer.cell(row, col).string(cellValue).style(styles.String.Plain);
    }
  }

  return sheetOffer;
};

const TransactionsList = async (db, filter) => {
  if (filter.pageNumber == 0) {
    filter.pageNumber = constant.DEFAULT_PAGE_NUMBER;
  }
  if (filter.pageSize == 0) {
    filter.pageSize = constant.DEFAULT_PAGE_SIZE;
  }
  let offset;
  let limit;
  if (filter.pageSize != constant.UNLIMITED_PAGE_SIZE) {
    offset = (filter.pageNumber - 1) * filter.pageSize;
    limit = filter.pageSize;
  }
  const transactions = await db.trns.findAll({
    include: [
      {
        model: db.OFFERS,
        as: "offer",
        attributes: {
          include: [["risk_mgmt_price_recommendation", "risk_mgmt_price_rec"]],
          exclude: ["risk_mgmt_price_recommendation"],
        },
        where: {
          deleted_at: null,
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
          },
        ],
      },
    ],
    where: {
      datetime: {
        [Op.between]: [
          parsingStringToDateEarly(filter.fromDate),
          parsingStringToDateLate(filter.toDate),
        ],
      },
    },
    offset,
    limit,
  });

  const Offer = await Promise.all(
    transactions.map(async (row) => {
      const [Offer, err] = await toExportTransactionAPIStruct(row, true);
      return Offer;
    })
  );

  return Offer;
};
