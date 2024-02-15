import { parsingDateToString, parsingDateToIndoFormat } from "../parsing.js";
import { constant } from "../../constant/index.js";
import { type } from "os";

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
  "NAMA SUPPLIER KAPAL": 37,
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
const monthMapETA = {
  1: "JAN",
  2: "FEB",
  3: "MAR",
  4: "APR",
  5: "MAY",
  6: "JUN",
  7: "JUL",
  8: "AUG",
  9: "SEP",
  10: "OCT",
  11: "NOV",
  12: "DEC",
};

export const ConstructHeaderHistoryV2 = async (ws, styles) => {
  let sheetOffer = ws;

  ///////////////////////////////KOLOM OFFER DETAIL////////////////////////////////////////
  sheetOffer.column(1).setWidth(56 / 8);
  sheetOffer.column(2).setWidth(205 / 8);
  sheetOffer.column(3).setWidth(345 / 8);
  sheetOffer.column(4).setWidth(94 / 8);
  sheetOffer.column(5).setWidth(64 / 8);
  sheetOffer.column(6).setWidth(98 / 8);
  sheetOffer.column(7).setWidth(60 / 8);
  sheetOffer.column(8).setWidth(85 / 8);
  sheetOffer.column(9).setWidth(68 / 8);
  sheetOffer.column(10).setWidth(58 / 8);
  sheetOffer.column(11).setWidth(50 / 8);
  sheetOffer.column(12).setWidth(59 / 8);
  sheetOffer.column(13).setWidth(98 / 8);
  sheetOffer.column(14).setWidth(78 / 8);
  sheetOffer.column(15).setWidth(138 / 8);
  sheetOffer.column(16).setWidth(95 / 8);
  sheetOffer.column(17).setWidth(135 / 8);
  sheetOffer.column(18).setWidth(106 / 8);
  sheetOffer.column(19).setWidth(131 / 8);
  sheetOffer.column(20).setWidth(85 / 8);
  sheetOffer.column(21).setWidth(73 / 8);
  sheetOffer.column(22).setWidth(80 / 8);
  sheetOffer.column(23).setWidth(80 / 8);
  sheetOffer.column(24).setWidth(149 / 8);
  sheetOffer.column(25).setWidth(74 / 8);

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
  sheetOffer.row(1).freeze();
  sheetOffer.row(1).filter();

  sheetOffer
    .cell(1, 1)
    .string("No")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 2)
    .string("Day")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 3)
    .string("Nama Supplier")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 4)
    .string("NO BPA")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 5)
    .string("Kontrak")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 6)
    .string("PERIODE")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 7)
    .string("WEEK")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 8)
    .string("Insurance")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 9)
    .string("Freight")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 10)
    .string("Susut")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 11)
    .string("COF")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 12)
    .string("Darat")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 13)
    .string("Price All In")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 14)
    .string("QTY (kg)")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 15)
    .string("Price All in Value")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 16)
    .string("Price Incld")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 17)
    .string("Price Incld Value")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 18)
    .string("KPB Equivalent")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 19)
    .string("KPB Value")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 20)
    .string("Discharge")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 21)
    .string("ETA")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 22)
    .string("FFA CONTRACT")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 23)
    .string("FFA VALUE")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 24)
    .string("Terms of Handover")
    .style(styles.CustomTableHeadOfferDetail.Bordered);
  sheetOffer
    .cell(1, 25)
    .string("TRADER")
    .style(styles.CustomTableHeadOfferDetail.Bordered);

  sheetOffer
    .cell(1, 26)
    .string("LOADING PORT")
    .style(styles.CustomTableHeadLoadDischPort.Bordered);
  sheetOffer
    .cell(1, 27)
    .string("DISCH. PORT")
    .style(styles.CustomTableHeadLoadDischPort.Bordered);
  sheetOffer
    .cell(1, 28)
    .string("DUMMY")
    .style(styles.CustomTableHeadLoadDischPort.Bordered);
  sheetOffer
    .cell(1, 29)
    .string("CONFIRMED DELIVERY")
    .style(styles.CustomTableHeadLoadDischPort.Bordered);
  sheetOffer
    .cell(1, 30)
    .string("TGL REALISASI DELIVERY")
    .style(styles.CustomTableHeadLoadDischPort.Bordered);
  sheetOffer
    .cell(1, 31)
    .string("NO GR RECEIVING")
    .style(styles.CustomTableHeadLoadDischPort.Bordered);
  sheetOffer
    .cell(1, 32)
    .string("QTY GR RECEIVING")
    .style(styles.CustomTableHeadLoadDischPort.Bordered);
  sheetOffer
    .cell(1, 33)
    .string("QTY REALISASI (BL)")
    .style(styles.CustomTableHeadLoadDischPort.Bordered);
  sheetOffer
    .cell(1, 34)
    .string("TGL BR")
    .style(styles.CustomTableHeadLoadDischPort.Bordered);
  sheetOffer
    .cell(1, 35)
    .string("QTY BR")
    .style(styles.CustomTableHeadLoadDischPort.Bordered);

  sheetOffer
    .cell(1, 36)
    .string("NAMA SUPPLIER KAPAL")
    .style(styles.CustomTableHeadSuppKapal.Bordered);

  sheetOffer
    .cell(1, 37)
    .string("NAMA KAPAL")
    .style(styles.CustomTableHeadSuppKapal.Bordered);
  sheetOffer
    .cell(1, 38)
    .string("BUDGET FREIGHT KAPAL")
    .style(styles.CustomTableHeadSuppKapal.Bordered);
  sheetOffer
    .cell(1, 39)
    .string("ACTUAL FREIGHT KAPAL")
    .style(styles.CustomTableHeadSuppKapal.Bordered);
  sheetOffer
    .cell(1, 40)
    .string("RUTE ANGKUT TRUCKING")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 41)
    .string("BUDGET TRUCKING")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);

  sheetOffer
    .cell(1, 42)
    .string("AVG ACTUAL TRUCKING")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 43)
    .string("NAMA TRANSPORTIR")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 44)
    .string("QTY GR BIAYA TRUCKING BONGKAR")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 45)
    .string("ACTUAL TRUCKING")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 46)
    .string("NAMA TRANSPORTIR (2)")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 47)
    .string("QTY GR BIAYA TRUCKING BONGKAR")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 48)
    .string("ACTUAL TRUCKING")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 49)
    .string("NAMA TRANSPORTIR (3)")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 50)
    .string("QTY GR BIAYA TRUCKING BONGKAR")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 51)
    .string("ACTUAL TRUCKING")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 52)
    .string("NAMA TRANSPORTIR (4)")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 53)
    .string("QTY GR BIAYA TRUCKING BONGKAR")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 54)
    .string("ACTUAL TRUCKING")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 55)
    .string("NAMA TRANSPORTIR (5)")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 56)
    .string("QTY GR BIAYA TRUCKING BONGKAR")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 57)
    .string("ACTUAL TRUCKING")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 58)
    .string("NAMA TRANSPORTIR (6)")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 59)
    .string("QTY GR BIAYA TRUCKING BONGKAR")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 60)
    .string("ACTUAL TRUCKING")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 61)
    .string("NAMA TRANSPORTIR (7)")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 62)
    .string("QTY GR BIAYA TRUCKING BONGKAR")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 63)
    .string("ACTUAL TRUCKING")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 64)
    .string("NAMA TRANSPORTIR (8)")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 65)
    .string("QTY GR BIAYA TRUCKING BONGKAR")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 66)
    .string("ACTUAL TRUCKING")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 67)
    .string("NAMA TRANSPORTIR (9)")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 68)
    .string("QTY GR BIAYA TRUCKING BONGKAR")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 69)
    .string("ACTUAL TRUCKING")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 70)
    .string("NAMA TRANSPORTIR (10)")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 71)
    .string("QTY GR BIAYA TRUCKING BONGKAR")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 72)
    .string("ACTUAL TRUCKING")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 73)
    .string("TGL BAST MUAT")
    .style(styles.CustomTableHeadBAST.Bordered);
  sheetOffer
    .cell(1, 74)
    .string("TGL MULAI MUAT")
    .style(styles.CustomTableHeadBAST.Bordered);
  sheetOffer
    .cell(1, 75)
    .string("TGL SELESAI MUAT")
    .style(styles.CustomTableHeadBAST.Bordered);
  sheetOffer
    .cell(1, 76)
    .string("WAKTU KEGIATAN MUAT")
    .style(styles.CustomTableHeadBAST.Bordered);
  sheetOffer
    .cell(1, 77)
    .string("QTY BAST MUAT")
    .style(styles.CustomTableHeadBAST.Bordered);
  sheetOffer
    .cell(1, 78)
    .string("TGL BAST DI PABRIK")
    .style(styles.CustomTableHeadBAST.Bordered);
  sheetOffer
    .cell(1, 79)
    .string("QTY BAST DI PABRIK")
    .style(styles.CustomTableHeadBAST.Bordered);
  sheetOffer
    .cell(1, 80)
    .string("REALISASI TGL MULAI BONGKAR")
    .style(styles.CustomTableHeadBAST.Bordered);
  sheetOffer
    .cell(1, 81)
    .string("REALISASI TGL SELESAI BONGKAR")
    .style(styles.CustomTableHeadBAST.Bordered);
  sheetOffer
    .cell(1, 82)
    .string("FFA FINAL PENYERAHAN")
    .style(styles.CustomTableHeadBAST.Bordered);
  sheetOffer
    .cell(1, 83)
    .string("FFA FINAL PABRIK BKP")
    .style(styles.CustomTableHeadBAST.Bordered);
  sheetOffer
    .cell(1, 84)
    .string("M+I FINAL PENYERAHAN")
    .style(styles.CustomTableHeadBAST.Bordered);
  sheetOffer
    .cell(1, 85)
    .string("M+I FINAL PABRIK BKP")
    .style(styles.CustomTableHeadBAST.Bordered);
  sheetOffer
    .cell(1, 86)
    .string("DOBI FINAL PENYERAHAN")
    .style(styles.CustomTableHeadBAST.Bordered);
  sheetOffer
    .cell(1, 87)
    .string("DOBI FINAL PABRIK BKP")
    .style(styles.CustomTableHeadBAST.Bordered);
  sheetOffer
    .cell(1, 88)
    .string("TOTOX FINAL PENYERAHAN")
    .style(styles.CustomTableHeadBAST.Bordered);
  sheetOffer
    .cell(1, 89)
    .string("TOTOX FINAL PABRIK BKP")
    .style(styles.CustomTableHeadBAST.Bordered);
  sheetOffer
    .cell(1, 90)
    .string("IV FINAL PENYERAHAN")
    .style(styles.CustomTableHeadBAST.Bordered);
  sheetOffer
    .cell(1, 91)
    .string("IV FINAL PABRIK BKP")
    .style(styles.CustomTableHeadBAST.Bordered);
  sheetOffer
    .cell(1, 92)
    .string("LAMA PERJALANAN")
    .style(styles.CustomTableHeadBAST.Bordered);
  sheetOffer.column(3).freeze();
  return sheetOffer;
};

export const ConstructBodyHistoryV2 = async (ws, styles, offers) => {
  const sheetOffer = ws;

  const emptyCell = (row, col) => {
    sheetOffer.cell(row, col).string("").style(styles.String.Plain);
  };

  let logisticOfferIdInOneOffer = [];
  let startRow = 2;
  let countingRowLoop = 0;
  let logisticOfferOnlyLTruck = [];
  let logisticOfferOnlyShip = [];
  let logisticOfferOnlyDTruck = [];
  let logisticOfferOnlyFranco = [];

  for (let key in offers) {
    let addRowEveryTransportirInOneOffer = 0;
    let offersLoop = offers[key].Offer;

    //check how many logistic offer in one offer
    for (let key2 in offersLoop?.lOffers) {
      logisticOfferIdInOneOffer.push(
        offersLoop?.lOffers[key2].logistic_offer_id
      );
    }

    if (
      logisticOfferIdInOneOffer.length == 0 ||
      logisticOfferIdInOneOffer.length == 1
    ) {
      addRowEveryTransportirInOneOffer = 0;
    } else {
      if (offersLoop?.terms_of_handover == "franco") {
      } else if (offersLoop?.terms_of_handover == "cif") {
        addRowEveryTransportirInOneOffer +=
          offersLoop?.lOffers.filter(
            (el) => el.type === "ship" && el.status === "approved"
          ).length - 1;
      } else if (offersLoop?.terms_of_handover == "fob") {
        addRowEveryTransportirInOneOffer +=
          offersLoop?.lOffers.filter(
            (el) => el.type === "ship" && el.status === "approved"
          ).length - 1;
      } else if (offersLoop?.terms_of_handover == "loco_luar_pulau") {
        addRowEveryTransportirInOneOffer +=
          offersLoop?.lOffers.filter(
            (el) => el.type === "loading_truck" && el.status === "approved"
          ).length - 1;
      }
    }
    logisticOfferIdInOneOffer = [...new Set(logisticOfferIdInOneOffer)];
    if (logisticOfferIdInOneOffer.length != 0) {
      let counterMundur = logisticOfferIdInOneOffer.length;
      for (let id in logisticOfferIdInOneOffer) {
        if (offersLoop?.terms_of_handover === "loco_luar_pulau") {
          logisticOfferOnlyLTruck =
            offersLoop?.lOffers.length === 0
              ? []
              : offersLoop?.lOffers.filter(
                  (el) =>
                    el.logistic_offer_id == logisticOfferIdInOneOffer[id] &&
                    el.type == "loading_truck" &&
                    el.status == "approved"
                );
          logisticOfferOnlyShip =
            offersLoop?.lOffers.length === 0
              ? []
              : offersLoop?.lOffers.filter(
                  (el) =>
                    el.logistic_offer_id == logisticOfferIdInOneOffer[id] &&
                    el.type == "ship" &&
                    el.status == "approved"
                );
          logisticOfferOnlyDTruck =
            offersLoop?.lOffers.length === 0
              ? []
              : offersLoop?.lOffers
                  .filter(
                    (el) =>
                      el.logistic_offer_id == logisticOfferIdInOneOffer[id] &&
                      el.type == "discharged_truck" &&
                      el.status == "approved"
                  )
                  .sort((a, b) => a.created_at - b.created_at);
        } else if (offersLoop?.terms_of_handover === "fob") {
          logisticOfferOnlyLTruck = [];
          logisticOfferOnlyShip =
            offersLoop?.lOffers.length === 0
              ? []
              : offersLoop?.lOffers.filter(
                  (el) =>
                    el.logistic_offer_id == logisticOfferIdInOneOffer[id] &&
                    el.type == "ship" &&
                    el.status == "approved"
                );
          logisticOfferOnlyDTruck =
            offersLoop?.lOffers.length === 0
              ? []
              : offersLoop?.lOffers
                  .filter(
                    (el) =>
                      el.logistic_offer_id == logisticOfferIdInOneOffer[id] &&
                      el.type == "discharged_truck" &&
                      el.status == "approved"
                  )
                  .sort((a, b) => a.created_at - b.created_at);
        } else if (offersLoop?.terms_of_handover === "cif") {
          logisticOfferOnlyLTruck = [];
          logisticOfferOnlyShip =
            offersLoop?.lOffers.length === 0
              ? []
              : offersLoop?.lOffers.filter(
                  (el) =>
                    el.logistic_offer_id == logisticOfferIdInOneOffer[id] &&
                    el.type == "ship" &&
                    el.status == "approved"
                );

          logisticOfferOnlyDTruck =
            offersLoop?.lOffers.length === 0
              ? []
              : offersLoop?.lOffers
                  .filter(
                    (el) =>
                      el.logistic_offer_id == logisticOfferIdInOneOffer[id] &&
                      el.type == "discharged_truck" &&
                      el.status == "approved"
                  )
                  .sort((a, b) => a.created_at - b.created_at);
        } else if (offersLoop?.terms_of_handover === "franco") {
          logisticOfferOnlyLTruck = [];
          logisticOfferOnlyShip = [];
          logisticOfferOnlyDTruck = [];
          logisticOfferOnlyFranco = offersLoop?.lOffers.filter(
            (el) => el.type === "franco" && el.status === "approved"
          );
        } else if (offersLoop?.terms_of_handover === "loco_dalam_pulau") {
          logisticOfferOnlyLTruck = [];
          logisticOfferOnlyShip = [];
          logisticOfferOnlyDTruck =
            offersLoop?.lOffers.length === 0
              ? []
              : offersLoop?.lOffers
                  .filter(
                    (el) =>
                      el.logistic_offer_id == logisticOfferIdInOneOffer[id] &&
                      el.type == "discharged_truck" &&
                      el.status == "approved"
                  )
                  .sort((a, b) => a.created_at - b.created_at);
        }
        const handoverTermsLogisticMapping = {
          franco: logisticOfferOnlyFranco,
          cif: logisticOfferOnlyDTruck,
          fob: logisticOfferOnlyShip,
          loco_luar_pulau: logisticOfferOnlyLTruck,
          loco_dalam_pulau: logisticOfferOnlyDTruck,
        };
        for (let row = startRow; row < startRow + 1; row++) {
          for (let col = 1; col <= 100; col++) {
            //colA
            if (col == 1) {
              console.log("colA");

              sheetOffer
                .cell(row, col)
                .string(
                  `${parseInt(key) + 1}${
                    counterMundur <= logisticOfferIdInOneOffer.length
                      ? "S".repeat(
                          logisticOfferIdInOneOffer.length - counterMundur
                        )
                      : ""
                  }`
                )
                .style(styles.Number.Plain);
            }

            if (col == 2) {
              //colB
              console.log("colB");
              sheetOffer
                .cell(row, col)
                .date(`${parsingDateToIndoFormat(offersLoop?.datetime)}`)
                .style(styles.Date.Plain);
            }

            if (col == 3) {
              //colC
              console.log("colC");
              sheetOffer
                .cell(row, col)
                .string(
                  `${!offersLoop?.spplr.name ? "" : offersLoop?.spplr.name}`
                )
                .style(styles.String.Plain);
            }

            if (col == 4) {
              //colD
              console.log("colD");

              sheetOffer
                .cell(row, col)
                .string(`${offersLoop?.po_number ?? offersLoop?.id}`)
                .style(styles.String.Plain);
            }
            if (col == 5) {
              //colE
              console.log("colE");
              sheetOffer
                .cell(row, col)
                .string(`${offersLoop?.contract_number ?? ""}`)
                .style(styles.String.Plain);
            }
            if (col == 6) {
              //colF
              console.log("colF");
              sheetOffer
                .cell(row, col)
                .string(
                  `${
                    monthMapping[
                      parsingDateToString(offersLoop?.datetime).split("-")[1]
                    ] +
                    " " +
                    parsingDateToString(offersLoop?.datetime).split("-")[0]
                  }`
                )
                .style(styles.String.Plain);
            }
            if (col == 7) {
              //colG
              console.log("colG");
              sheetOffer.addDataValidation({
                type: "list",
                allowBlank: true,
                prompt: "Choose week",
                errorTitle: "Invalid Option",
                error: "Select Option from Dropdown",
                showDropDown: true,
                sqref: `G${row}:G${row}`,
                formulas: ["W1,W2,W3,W4,W5"],
              });
              sheetOffer
                .cell(row, col)
                .string(`${!offersLoop?.week ? "" : offersLoop?.week}`)
                .style(styles.String.Plain);
            }
            if (col == 8) {
              //colH
              console.log("colH");

              if (!offersLoop?.price_insurance) {
                emptyCell(row, col);
              } else {
                sheetOffer
                  .cell(row, col)
                  .number(offersLoop?.price_insurance)
                  .style(styles.Numeric.Plain);
              }
            }
            if (col == 9) {
              console.log("colI");
              //colI
              if (!offersLoop?.price_freight_kapal) {
                emptyCell(row, col);
              } else {
                sheetOffer
                  .cell(row, col)
                  .number(offersLoop?.price_freight_kapal)
                  .style(styles.Numeric.Plain);
              }
            }

            if (col == 10) {
              console.log("colJ");
              //colJ
              if (!offersLoop?.price_susut) {
                emptyCell(row, col);
              } else {
                sheetOffer
                  .cell(row, col)
                  .number(parseInt(`${offersLoop?.price_susut}`))
                  .style(styles.Number.Plain);
              }
            }

            if (col == 11) {
              console.log("colK");
              //colK
              if (!offersLoop?.price_cof) {
                emptyCell(row, col);
              } else {
                sheetOffer
                  .cell(row, col)
                  .number(parseInt(`${offersLoop?.price_cof}`))
                  .style(styles.Number.Plain);
              }
            }

            if (col == 12) {
              console.log("colL");
              //colL
              if (logisticOfferOnlyLTruck.length == 0) {
                emptyCell(row, col);
              } else {
                sheetOffer
                  .cell(row, col)
                  .number(offersLoop?.price_freight_darat)
                  .style(styles.Numeric.Plain);
              }
            }

            if (col == 13) {
              console.log("colM");
              //ok
              //colM
              // let formula = `P${row}+SUM(H${row}:L${row})`;
              // sheetOffer.cell(row, col).formula(formula).style(styles.Price.Plain);

              sheetOffer
                .cell(row, col)
                .number(
                  parseFloat(
                    `${!offersLoop?.price ? 0 : offersLoop?.price.toFixed(2)}`
                  )
                )
                .style(styles.RupiahPrice.Plain);
            }

            if (col == 14) {
              console.log("colN");
              //colN

              let value;
              if (offersLoop?.lOffers.length == 0) {
                if (offersLoop?.terms_of_handover == "franco") {
                  value = offersLoop?.quantity;
                }
              } else if (offersLoop?.lOffers.length != 0) {
                if (
                  offersLoop?.terms_of_handover == "franco" ||
                  offersLoop?.terms_of_handover == "loco_dalam_pulau"
                ) {
                  value = offersLoop?.quantity;
                } else if (
                  offersLoop?.terms_of_handover == "cif" ||
                  offersLoop?.terms_of_handover == "fob"
                ) {
                  value = logisticOfferOnlyShip[0].quantity;
                } else if (offersLoop?.terms_of_handover == "loco_luar_pulau") {
                  value = logisticOfferOnlyLTruck[0].quantity;
                }
              }
              sheetOffer
                .cell(row, col)
                .number(parseInt(`${value}`) * 1000)
                .style(styles.NumberWithDot.Plain);
            }

            if (col == 15) {
              console.log("colO");
              //colO
              let formula = `M${row}*N${row}`;

              sheetOffer
                .cell(row, col)
                .formula(formula)
                .style(styles.RupiahPriceValue.Plain);
            }

            if (col == 16) {
              console.log("colP");
              //ok
              //colP
              sheetOffer
                .cell(row, col)
                .number(
                  parseFloat(
                    `${
                      !offersLoop?.price_exclude ? 0 : offersLoop?.price_exclude
                    }`
                  ).toFixed(2) * 1.11
                )
                .style(styles.RupiahPrice.Plain);
            }

            if (col == 17) {
              console.log("colQ");
              //colQ
              let formula = `P${row}*N${row}`;
              sheetOffer
                .cell(row, col)
                .formula(formula)
                .style(styles.RupiahPriceValue.Plain);
            }

            if (col == 18) {
              console.log("colR");
              //colR

              if (!offersLoop?.price_final) {
                emptyCell(row, col);
              } else {
                sheetOffer
                  .cell(row, col)
                  .number(
                    parseFloat(
                      `${
                        !offers[key].kpb_include
                          ? 0
                          : offers[key].kpb_include.toFixed(2)
                      }`
                    )
                  )
                  .style(styles.RupiahPrice.Plain);
              }
            }

            if (col == 19) {
              console.log("colS");
              //colS
              if (!offersLoop?.price_final) {
                emptyCell(row, col);
              } else {
                let formula = `R${row}*N${row}`;
                sheetOffer
                  .cell(row, col)
                  .formula(formula)
                  .style(styles.RupiahPriceValue.Plain);
              }
            }

            if (col == 20) {
              console.log("colT");
              //colT
              sheetOffer
                .cell(row, col)
                .string(
                  `${
                    !offersLoop?.whs ? "" : offersLoop?.whs.name.split(" ")[1]
                  }`
                )
                .style(styles.String.Plain);
            }

            if (col == 21) {
              console.log("colU");
              //colU
              console.log(offersLoop?.eta_to.getMonth() + 1);
              const getETA = offersLoop?.eta_to.getDate() < 15 ? "1ST" : "2ND";
              const getETAMonth = offersLoop?.eta_to.getMonth() + 1;
              sheetOffer
                .cell(row, col)
                .string(`${getETA} ${monthMapETA[getETAMonth]}`)
                .style(styles.Date.Plain);
            }

            if (col == 22) {
              console.log("colV");
              //colV
              sheetOffer
                .cell(row, col)
                .number(parseInt(`${offersLoop?.quality_ffa}`))
                .style(styles.Numeric.Plain);
            }

            if (col == 23) {
              console.log("colW");
              //colW
              let formula = `V${row}*N${row}`;
              sheetOffer
                .cell(row, col)
                .formula(formula)
                .style(styles.NumberWithDot.Plain);
            }

            if (col == 24) {
              console.log("colX");
              //colX

              sheetOffer
                .cell(row, col)
                .string(
                  `${
                    constant.TERMS_OF_HANDOVER_TO_PO_MAP[
                      offersLoop?.terms_of_handover
                    ]
                  }`
                )
                .style(styles.String.Plain);
            }

            if (col == 25) {
              console.log("colY");
              //colY
              let firstName =
                offersLoop?.dealer.name.length > 1
                  ? offersLoop?.dealer.name.split(" ")[0]
                  : offersLoop?.dealer.name;

              sheetOffer
                .cell(row, col)
                .string(firstName)
                .style(styles.String.Plain);
            }
            if (col == 26) {
              console.log("colZ");
              //colZ
              sheetOffer
                .cell(row, col)
                .string(
                  `${
                    offersLoop?.terms_of_handover == "franco" ||
                    offersLoop?.terms_of_handover == "cif" ||
                    offersLoop?.terms_of_handover == "loco_dalam_pulau"
                      ? constant.TERMS_OF_HANDOVER_TO_PO_MAP[
                          offersLoop?.terms_of_handover
                        ]
                      : !offersLoop?.hOver_Loc
                      ? ""
                      : offersLoop?.hOver_Loc.name
                  }`
                )
                .style(styles.String.Plain);
            }
            if (col == 27) {
              console.log("colAA");
              //colAA
              sheetOffer
                .cell(row, col)
                .string(
                  `${
                    !offersLoop?.whs ? "" : offersLoop?.whs.name.split(" ")[1]
                  }`
                )
                .style(styles.String.Plain);
            }
            if (col == 28) {
              console.log("colAB");
              //colAB
              let formula = `Z${row}&AA${row}`;
              sheetOffer
                .cell(row, col)
                .formula(formula)
                .style(styles.String.Plain);
            }
            if (col == 29) {
              console.log("colAC");
              //colAC
              sheetOffer
                .cell(row, col)
                .date(
                  `${parsingDateToIndoFormat(offersLoop?.handover_date_to)}`
                )
                .style(styles.Date.Plain);
            }
            if (col == 30) {
              console.log("colAD");
          
              let date;

              if (offersLoop?.terms_of_handover == "franco") {
                date = logisticOfferOnlyFranco[0]?.actual_loading_date ?? "";
              } else if (
                offersLoop?.terms_of_handover == "cif" ||
                offersLoop?.terms_of_handover == "loco_dalam_pulau"
              ) {                
                date = logisticOfferOnlyDTruck[0]?.actual_loading_date ?? "";
              } else if (
                offersLoop?.terms_of_handover == "fob" ||
                offersLoop?.terms_of_handover == "loco_luar_pulau"
              ) {
                date = logisticOfferOnlyShip[0]?.delivery_date ?? "";
              }
              if (!date) {
                sheetOffer.cell(row, col).string(``).style(styles.String.Plain);
              } else {
                sheetOffer
                  .cell(row, col)
                  .date(`${parsingDateToIndoFormat(date)}`)
                  .style(styles.Date.Plain);
              }
            }
            if (col == 31) {
              console.log("colAE");
              //colAE
              //done
              sheetOffer
                .cell(row, col)
                .string(
                  `${
                    offersLoop?.terms_of_handover == "franco"
                      ? logisticOfferOnlyFranco[0]?.gr_number
                        ? JSON.parse(
                            logisticOfferOnlyFranco[0]?.gr_number
                          ).join(",")
                        : ""
                      : offersLoop?.terms_of_handover == "cif" ||
                        offersLoop?.terms_of_handover == "loco_dalam_pulau"
                      ? logisticOfferOnlyDTruck[0]?.gr_number
                        ? JSON.parse(
                            logisticOfferOnlyDTruck[0]?.gr_number
                          ).join(",")
                        : ""
                      : offersLoop?.terms_of_handover == "fob"
                      ? logisticOfferOnlyShip[0]?.gr_number
                        ? JSON.parse(logisticOfferOnlyShip[0]?.gr_number).join(
                            ","
                          )
                        : ""
                      : offersLoop?.terms_of_handover == "loco_luar_pulau"
                      ? logisticOfferOnlyLTruck[0]?.gr_number
                        ? JSON.parse(
                            logisticOfferOnlyLTruck[0]?.gr_number
                          ).join(",")
                        : ""
                      : ""
                  }`
                )
                .style(styles.String.Plain);
            }
            if (col == 32) {
              console.log("colAF");
              //colAF
              if (offersLoop?.terms_of_handover == "franco") {
                if (!logisticOfferOnlyFranco[0]?.gr_quantity) {
                  emptyCell(row, col);
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyFranco[0]?.gr_quantity * 1000)
                    .style(styles.NumberWithDot.Plain);
                }
              } else if (
                offersLoop?.terms_of_handover == "cif" ||
                offersLoop?.terms_of_handover == "loco_dalam_pulau"
              ) {
                if (!logisticOfferOnlyDTruck[0]?.gr_quantity) {
                  emptyCell(row, col);
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyDTruck[0]?.gr_quantity * 1000)
                    .style(styles.NumberWithDot.Plain);
                }
              } else if (offersLoop?.terms_of_handover == "fob") {
                if (!logisticOfferOnlyShip[0]?.gr_quantity) {
                  emptyCell(row, col);
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyShip[0]?.gr_quantity * 1000)
                    .style(styles.NumberWithDot.Plain);
                }
              } else if (offersLoop?.terms_of_handover == "loco_luar_pulau") {
                if (!logisticOfferOnlyLTruck[0]?.gr_quantity) {
                  emptyCell(row, col);
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyLTruck[0]?.gr_quantity * 1000)
                    .style(styles.NumberWithDot.Plain);
                }
              }
            }
            if (col == 33) {
              console.log("colAG");
              //colAG
              if (offersLoop?.terms_of_handover == "franco") {
                if (!logisticOfferOnlyFranco[0]?.quantity_bl) {
                  emptyCell(row, col);
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyFranco[0]?.quantity_bl * 1000)
                    .style(styles.NumberWithDot.Plain);
                }
              } else if (
                offersLoop?.terms_of_handover == "cif" ||
                offersLoop?.terms_of_handover == "loco_dalam_pulau"
              ) {
                if (!logisticOfferOnlyDTruck[0]?.quantity_bl) {
                  emptyCell(row, col);
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyDTruck[0]?.quantity_bl * 1000)
                    .style(styles.NumberWithDot.Plain);
                }
              } else if (offersLoop?.terms_of_handover == "fob") {
                if (!logisticOfferOnlyShip[0]?.quantity_bl) {
                  emptyCell(row, col);
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyShip[0]?.quantity_bl * 1000)
                    .style(styles.NumberWithDot.Plain);
                }
              } else if (offersLoop?.terms_of_handover == "loco_luar_pulau") {
                if (!logisticOfferOnlyLTruck[0]?.quantity_bl) {
                  emptyCell(row, col);
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyLTruck[0]?.quantity_bl * 1000)
                    .style(styles.NumberWithDot.Plain);
                }
              }
            }
            if (col == 34) {
              console.log("colAH");
              //colAH
              sheetOffer
                .cell(row, col)
                .string(
                  `${
                    offersLoop?.terms_of_handover == "franco"
                      ? !logisticOfferOnlyFranco[0]?.br_date
                        ? ""
                        : parsingDateToIndoFormat(
                            logisticOfferOnlyFranco[0]?.br_date
                          )
                      : offersLoop?.terms_of_handover == "cif" ||
                        offersLoop?.terms_of_handover == "loco_dalam_pulau"
                      ? !logisticOfferOnlyDTruck[0]?.br_date
                        ? ""
                        : parsingDateToIndoFormat(
                            logisticOfferOnlyDTruck[0]?.br_date
                          )
                      : offersLoop?.terms_of_handover == "fob"
                      ? !logisticOfferOnlyShip[0]?.br_date
                        ? ""
                        : parsingDateToIndoFormat(
                            logisticOfferOnlyShip[0]?.br_date
                          )
                      : offersLoop?.terms_of_handover == "loco_luar_pulau"
                      ? !logisticOfferOnlyLTruck[0]?.br_date
                        ? ""
                        : parsingDateToIndoFormat(
                            logisticOfferOnlyLTruck[0]?.br_date
                          )
                      : ""
                  }`
                )
                .style(styles.String.Plain);
            }
            if (col == 35) {
              console.log("colAI");
              //colAI
              const handoverTerm = offersLoop?.terms_of_handover;
              const brQuantity =
                handoverTermsLogisticMapping[handoverTerm]?.[0]?.br_quantity *
                1000;
              if (!brQuantity) {
                emptyCell(row, col);
              } else {
                sheetOffer
                  .cell(row, col)
                  .number(brQuantity)
                  .style(styles.NumberWithDot.Plain);
              }
            }
            if (col == 36) {
              console.log("colAJ");
              //colAI
              sheetOffer
                .cell(row, col)
                .string(
                  `${
                    offersLoop?.terms_of_handover == "loco_luar_pulau" ||
                    offersLoop?.terms_of_handover == "fob" ||
                    offersLoop?.terms_of_handover == "cif"
                      ? logisticOfferOnlyShip[0]?.trnsprtr.name ?? ""
                      : offersLoop?.terms_of_handover == "franco"
                      ? ""
                      : ""
                  }`
                )
                .style(styles.String.Plain);
            }
            if (col == 37) {
              console.log("colAK");
              //colAI
              sheetOffer
                .cell(row, col)
                .string(
                  `${
                    offersLoop?.terms_of_handover == "loco_luar_pulau" ||
                    offersLoop?.terms_of_handover == "fob" ||
                    offersLoop?.terms_of_handover == "cif"
                      ? logisticOfferOnlyShip[0]?.ship?.name ?? ""
                      : offersLoop?.terms_of_handover == "franco"
                      ? ""
                      : ""
                  }`
                )
                .style(styles.String.Plain);
            }
            if (col == 38) {
              console.log("colAL");
              //colAI
              sheetOffer
                .cell(row, col)
                .string(
                  `${
                    offersLoop?.terms_of_handover == "loco_luar_pulau" ||
                    offersLoop?.terms_of_handover == "fob" ||
                    offersLoop?.terms_of_handover == "cif"
                      ? logisticOfferOnlyShip[0]?.budget ?? ""
                      : offersLoop?.terms_of_handover == "franco"
                      ? ""
                      : ""
                  }`
                )
                .style(styles.String.Plain);
            }
            if (col == 39) {
              console.log("colAM");
              //colAM
              sheetOffer
                .cell(row, col)
                .string(
                  `${
                    offersLoop?.terms_of_handover == "loco_luar_pulau" ||
                    offersLoop?.terms_of_handover == "fob" ||
                    offersLoop?.terms_of_handover == "cif"
                      ? logisticOfferOnlyShip[0]?.price ?? ""
                      : offersLoop?.terms_of_handover == "franco"
                      ? ""
                      : ""
                  }`
                )
                .style(styles.String.Plain);
            }
            if (col == 40) {
              console.log("colAN");
              //colAN
            
              if (!logisticOfferOnlyDTruck[0]?.dRoute?.hOver_loc?.name) {
                sheetOffer.cell(row, col).string(``).style(styles.String.Plain);
              } else {
                sheetOffer
                  .cell(row, col)
                  .string(
                    `${
                      offersLoop?.terms_of_handover == "loco_luar_pulau" ||
                      offersLoop?.terms_of_handover == "fob" ||
                      offersLoop?.terms_of_handover == "cif" ||
                      offersLoop?.terms_of_handover == "loco_dalam_pulau"
                        ? `${logisticOfferOnlyDTruck[0]?.dRoute?.hOver_loc?.name}${logisticOfferOnlyDTruck[0]?.dRoute?.dstn_loc?.name}`
                        : offersLoop?.terms_of_handover == "franco"
                        ? ""
                        : ""
                    }`
                  )
                  .style(styles.String.Plain);
              }
            }
            if (col == 41) {
              console.log("colAO");
              //colAO
              sheetOffer
                .cell(row, col)
                .formula(
                  `=IFERROR(VLOOKUP($AN${row},'Budget Freight'!$N$4:$O$10000,2,FALSE),"")`
                )
                .style(styles.String.Plain);
            }
            if (col == 42) {
              console.log("colAP");
              //colAP
              sheetOffer
                .cell(row, col)
                .formula(
                  `=IFERROR(((AR${row}*AS${row})+(AU${row}*AV${row})+(AX${row}*AY${row})+(BA${row}*BB${row})+(BD${row}*BE${row})+(BG${row}*BH${row})+(BJ${row}*BK${row})+(BM${row}*BN${row})+(BP${row}*BQ${row})+(BS${row}*BT${row}))/(AR${row}+AU${row}+AX${row}+BA${row}+BD${row}+BG${row}+BJ${row}+BM${row}+BP${row}+BS${row}),"")`
                )
                .style(styles.String.Plain);
            }

            //COL DISCHARGED TRUCK
            let lengthOfDischargedTruck = logisticOfferOnlyDTruck.length;
            if (lengthOfDischargedTruck > 0) {
              for (let i = 0; i < lengthOfDischargedTruck; i++) {
                if (col == 43 + i * 3) {
                  console.log("colNamaTruck");
                  //colNamaTruck
                  sheetOffer
                    .cell(row, col)
                    .string(
                      `${
                        offersLoop?.terms_of_handover == "loco_luar_pulau" ||
                        offersLoop?.terms_of_handover == "fob" ||
                        offersLoop?.terms_of_handover == "cif" ||
                        offersLoop?.terms_of_handover == "loco_dalam_pulau"
                          ? logisticOfferOnlyDTruck[i]?.trnsprtr?.name ?? ""
                          : ""
                      }`
                    )
                    .style(styles.String.Plain);
                }
                if (col == 44 + i * 3) {
                  console.log("colNamaTruck");
                  //colNamaTruck
                  if (
                    offersLoop?.terms_of_handover == "loco_luar_pulau" ||
                    offersLoop?.terms_of_handover == "fob" ||
                    offersLoop?.terms_of_handover == "cif" ||
                    offersLoop?.terms_of_handover == "loco_dalam_pulau"
                  ) {
                    logisticOfferOnlyDTruck[i]?.quantity
                      ? sheetOffer
                          .cell(row, col)
                          .number(logisticOfferOnlyDTruck[i]?.quantity * 1000)
                          .style(styles.NumberWithDot.Plain)
                      : sheetOffer
                          .cell(row, col)
                          .string(``)
                          .style(styles.String.Plain);
                  }
                }
                if (col == 45 + i * 3) {
                  console.log("colNamaTruck");
                  //colNamaTruck
                  if (
                    offersLoop?.terms_of_handover == "loco_luar_pulau" ||
                    offersLoop?.terms_of_handover == "fob" ||
                    offersLoop?.terms_of_handover == "cif" ||
                    offersLoop?.terms_of_handover == "loco_dalam_pulau"
                  ) {
                    logisticOfferOnlyDTruck[i]?.price
                      ? sheetOffer
                          .cell(row, col)
                          .number(logisticOfferOnlyDTruck[i]?.price)
                          .style(styles.Numeric.Plain)
                      : sheetOffer
                          .cell(row, col)
                          .string(``)
                          .style(styles.String.Plain);
                  }
                }
              }
            }
            if (col == 73) {
              console.log("colBU");
              
              let date;
              if (offersLoop?.terms_of_handover == "franco") {
                date = "";
              } else if (
                offersLoop?.terms_of_handover == "cif" ||
                offersLoop?.terms_of_handover == "loco_dalam_pulau"
              ) {
                date = "";
              } else if (
                offersLoop?.terms_of_handover == "fob" ||
                offersLoop?.terms_of_handover == "loco_luar_pulau"
              ) {
                date = logisticOfferOnlyShip[0]?.delivery_date ?? "";
              }
              if (!date) {
                sheetOffer.cell(row, col).string(``).style(styles.String.Plain);
              } else {
                sheetOffer
                  .cell(row, col)
                  .date(`${parsingDateToIndoFormat(date)}`)
                  .style(styles.Date.Plain);
              }
            }
            if (col == 74) {
              console.log("colBV");
            
              let date;
              if (offersLoop?.terms_of_handover == "franco") {
                date = "";
              } else if (
                offersLoop?.terms_of_handover == "cif" ||
                offersLoop?.terms_of_handover == "loco_dalam_pulau"
              ) {
                date = "";
              } else if (
                offersLoop?.terms_of_handover == "fob" ||
                offersLoop?.terms_of_handover == "loco_luar_pulau"
              ) {
                date = logisticOfferOnlyShip[0]?.actual_loading_date ?? "";
              }
              if (!date) {
                sheetOffer.cell(row, col).string(``).style(styles.String.Plain);
              } else {
                sheetOffer
                  .cell(row, col)
                  .date(`${parsingDateToIndoFormat(date)}`)
                  .style(styles.Date.Plain);
              }
            }
            if (col == 75) {
              console.log("colBW");
           
              let date;
              if (
                offersLoop?.terms_of_handover == "fob" ||
                offersLoop?.terms_of_handover == "loco_luar_pulau"
              ) {
                date = logisticOfferOnlyShip[0]?.delivery_date ?? "";
              }
              if (!date) {
                sheetOffer.cell(row, col).string(``).style(styles.String.Plain);
              } else {
                sheetOffer
                  .cell(row, col)
                  .date(`${parsingDateToIndoFormat(date)}`)
                  .style(styles.Date.Plain);
              }
            }
            if (col == 76) {
              console.log("colBX");
       
              let formula = `=IFERROR((BW${row}-BV${row}),"")`;
              sheetOffer.cell(row, col).formula(formula);
            }
            if (col == 77) {
              console.log("colBY");
              if (offersLoop?.terms_of_handover == "franco") {
                if (!logisticOfferOnlyFranco[0]?.quantity_bl) {
                  emptyCell(row, col);
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyFranco[0]?.quantity_bl * 1000)
                    .style(styles.NumberWithDot.Plain);
                }
              } else if (
                offersLoop?.terms_of_handover == "cif" ||
                offersLoop?.terms_of_handover == "loco_dalam_pulau"
              ) {
                if (!logisticOfferOnlyDTruck[0]?.quantity_bl) {
                  emptyCell(row, col);
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyDTruck[0]?.quantity_bl * 1000)
                    .style(styles.NumberWithDot.Plain);
                }
              } else if (offersLoop?.terms_of_handover == "fob") {
                if (!logisticOfferOnlyShip[0]?.quantity_bl) {
                  emptyCell(row, col);
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyShip[0]?.quantity_bl * 1000)
                    .style(styles.NumberWithDot.Plain);
                }
              } else if (offersLoop?.terms_of_handover == "loco_luar_pulau") {
                if (!logisticOfferOnlyLTruck[0]?.quantity_bl) {
                  emptyCell(row, col);
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyLTruck[0]?.quantity_bl * 1000)
                    .style(styles.NumberWithDot.Plain);
                }
              }
            }
            if (col == 78) {
              console.log("colBZ");
         
              let date;
              if (offersLoop?.terms_of_handover == "franco") {
                date = "";
              } else if (
                offersLoop?.terms_of_handover == "cif" ||
                offersLoop?.terms_of_handover == "loco_dalam_pulau"
              ) {
                date = "";
              } else if (
                offersLoop?.terms_of_handover == "fob" ||
                offersLoop?.terms_of_handover == "loco_luar_pulau"
              ) {
                date = logisticOfferOnlyShip[0]?.delivery_date ?? "";
              }
              if (!date) {
                sheetOffer.cell(row, col).string(``).style(styles.String.Plain);
              } else {
                sheetOffer
                  .cell(row, col)
                  .date(`${date}`)
                  .style(styles.Date.Plain);
              }
            }
            if (col == 79) {
              console.log("colCA");
              if (
                offersLoop?.terms_of_handover == "loco_luar_pulau" ||
                offersLoop?.terms_of_handover == "fob" ||
                offersLoop?.terms_of_handover == "cif" ||
                offersLoop?.terms_of_handover == "loco_dalam_pulau"
              ) {
                logisticOfferOnlyDTruck[0]?.qty_bast
                  ? sheetOffer
                      .cell(row, col)
                      .number(logisticOfferOnlyDTruck[0]?.qty_bast * 1000 ?? 0)
                      .style(styles.NumberWithDot.Plain)
                  : sheetOffer
                      .cell(row, col)
                      .string(``)
                      .style(styles.String.Plain);
              } else if (offersLoop?.terms_of_handover == "franco") {
                logisticOfferOnlyFranco[0]?.qty_bast
                  ? sheetOffer
                      .cell(row, col)
                      .number(logisticOfferOnlyFranco[0]?.qty_bast * 1000 ?? 0)
                      .style(styles.NumberWithDot.Plain)
                  : sheetOffer
                      .cell(row, col)
                      .string(``)
                      .style(styles.String.Plain);
              } else {
                sheetOffer.cell(row, col).string(``).style(styles.String.Plain);
              }
            }
            if (col == 80) {
              console.log("colCB");
              let date;
              if (offersLoop?.terms_of_handover == "franco") {
                date = logisticOfferOnlyFranco[0]?.actual_loading_date ?? "";
              } else if (
                offersLoop?.terms_of_handover == "cif" ||
                offersLoop?.terms_of_handover == "fob" ||
                offersLoop?.terms_of_handover == "loco_luar_pulau"
              ) {
                date = logisticOfferOnlyDTruck[0]?.actual_loading_date ?? "";
              } else if (offersLoop?.terms_of_handover == "loco_dalam_pulau") {
                date = logisticOfferOnlyDTruck[0]?.actual_loading_date ?? "";
              }
              if (!date) {
                sheetOffer.cell(row, col).string(``).style(styles.String.Plain);
              } else {
                sheetOffer
                  .cell(row, col)
                  .date(`${date}`)
                  .style(styles.Date.Plain);
              }
            }
            if (col == 81) {
              console.log("colCC");
              let date;
              if (offersLoop?.terms_of_handover == "franco") {
                date = logisticOfferOnlyFranco[0]?.discharged_date ?? "";
              } else if (
                offersLoop?.terms_of_handover == "cif" ||
                offersLoop?.terms_of_handover == "fob" ||
                offersLoop?.terms_of_handover == "loco_luar_pulau"
              ) {
                date = logisticOfferOnlyDTruck[0]?.discharged_date ?? "";
              } else if (offersLoop?.terms_of_handover == "loco_dalam_pulau") {
                date = logisticOfferOnlyDTruck[0]?.discharged_date ?? "";
              }
              if (!date) {
                sheetOffer.cell(row, col).string(``).style(styles.String.Plain);
              } else {
                sheetOffer
                  .cell(row, col)
                  .date(`${date}`)
                  .style(styles.Date.Plain);
              }
            }
            if (col == 82) {
              console.log("colCD");
              if (offersLoop?.terms_of_handover == "franco") {
                if (!logisticOfferOnlyFranco[0]?.finalhoverqffa) {
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyFranco[0]?.finalhoverqffa)
                    .style(styles.Numeric.Plain);
                }
              } else if (
                offersLoop?.terms_of_handover == "cif" ||
                offersLoop?.terms_of_handover == "loco_luar_pulau" ||
                offersLoop?.terms_of_handover == "fob"
              ) {
                if (!logisticOfferOnlyShip[0]?.finalhoverqffa) {
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyShip[0]?.finalhoverqffa)
                    .style(styles.Numeric.Plain);
                }
              } else if (offersLoop?.terms_of_handover == "loco_dalam_pulau") {
                if (!logisticOfferOnlyDTruck[0]?.finalhoverqffa) {
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyDTruck[0]?.finalhoverqffa)
                    .style(styles.Numeric.Plain);
                }
              }
            }
            if (col == 83) {
              console.log("colCE");
              if (offersLoop?.terms_of_handover == "franco") {
                if (!logisticOfferOnlyFranco[0]?.final_qffa) {
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyFranco[0]?.final_qffa)
                    .style(styles.Numeric.Plain);
                }
              } else if (
                offersLoop?.terms_of_handover == "cif" ||
                offersLoop?.terms_of_handover == "loco_luar_pulau" ||
                offersLoop?.terms_of_handover == "fob"
              ) {
                if (!logisticOfferOnlyShip[0]?.final_qffa) {
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyShip[0]?.final_qffa)
                    .style(styles.Numeric.Plain);
                }
              } else if (offersLoop?.terms_of_handover == "loco_dalam_pulau") {
                if (!logisticOfferOnlyDTruck[0]?.final_qffa) {
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyDTruck[0]?.final_qffa)
                    .style(styles.Numeric.Plain);
                }
              }
            }
            if (col == 84) {
              console.log("colCF");
              if (offersLoop?.terms_of_handover == "franco") {
                if (!logisticOfferOnlyFranco[0]?.finalhoverqmi) {
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyFranco[0]?.finalhoverqmi)
                    .style(styles.Numeric.Plain);
                }
              } else if (
                offersLoop?.terms_of_handover == "cif" ||
                offersLoop?.terms_of_handover == "loco_luar_pulau" ||
                offersLoop?.terms_of_handover == "fob"
              ) {
                if (!logisticOfferOnlyShip[0]?.finalhoverqmi) {
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyShip[0]?.finalhoverqmi)
                    .style(styles.Numeric.Plain);
                }
              } else if (offersLoop?.terms_of_handover == "loco_dalam_pulau") {
                if (!logisticOfferOnlyDTruck[0]?.finalhoverqmi) {
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyDTruck[0]?.finalhoverqmi)
                    .style(styles.Numeric.Plain);
                }
              }
            }
            if (col == 85) {
              console.log("colCG");
              if (offersLoop?.terms_of_handover == "franco") {
                if (!logisticOfferOnlyFranco[0]?.final_qmi) {
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyFranco[0]?.final_qmi)
                    .style(styles.Numeric.Plain);
                }
              } else if (
                offersLoop?.terms_of_handover == "cif" ||
                offersLoop?.terms_of_handover == "loco_luar_pulau" ||
                offersLoop?.terms_of_handover == "fob"
              ) {
                if (!logisticOfferOnlyShip[0]?.final_qmi) {
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyShip[0]?.final_qmi)
                    .style(styles.Numeric.Plain);
                }
              } else if (offersLoop?.terms_of_handover == "loco_dalam_pulau") {
                if (!logisticOfferOnlyDTruck[0]?.final_qmi) {
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyDTruck[0]?.final_qmi)
                    .style(styles.Numeric.Plain);
                }
              }
            }
            if (col == 86) {
              console.log("colCH");
              if (offersLoop?.terms_of_handover == "franco") {
                if (!logisticOfferOnlyFranco[0]?.finalhoverqdobi) {
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyFranco[0]?.finalhoverqdobi)
                    .style(styles.Numeric.Plain);
                }
              } else if (
                offersLoop?.terms_of_handover == "cif" ||
                offersLoop?.terms_of_handover == "loco_luar_pulau" ||
                offersLoop?.terms_of_handover == "fob"
              ) {
                if (!logisticOfferOnlyShip[0]?.finalhoverqdobi) {
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyShip[0]?.finalhoverqdobi)
                    .style(styles.Numeric.Plain);
                }
              } else if (offersLoop?.terms_of_handover == "loco_dalam_pulau") {
                if (!logisticOfferOnlyDTruck[0]?.finalhoverqdobi) {
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyDTruck[0]?.finalhoverqdobi)
                    .style(styles.Numeric.Plain);
                }
              }
            }
            if (col == 87) {
              console.log("colCI");
              if (offersLoop?.terms_of_handover == "franco") {
                if (!logisticOfferOnlyFranco[0]?.final_qdobi) {
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyFranco[0]?.final_qdobi)
                    .style(styles.Numeric.Plain);
                }
              } else if (
                offersLoop?.terms_of_handover == "cif" ||
                offersLoop?.terms_of_handover == "loco_luar_pulau" ||
                offersLoop?.terms_of_handover == "fob"
              ) {
                if (!logisticOfferOnlyShip[0]?.final_qdobi) {
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyShip[0]?.final_qdobi)
                    .style(styles.Numeric.Plain);
                }
              } else if (offersLoop?.terms_of_handover == "loco_dalam_pulau") {
                if (!logisticOfferOnlyDTruck[0]?.final_qdobi) {
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyDTruck[0]?.final_qdobi)
                    .style(styles.Numeric.Plain);
                }
              }
            }
            if (col == 88) {
              console.log("colCJ");
              if (offersLoop?.terms_of_handover == "franco") {
                if (!logisticOfferOnlyFranco[0]?.finalhoverqtotox) {
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyFranco[0]?.finalhoverqtotox)
                    .style(styles.Numeric.Plain);
                }
              } else if (
                offersLoop?.terms_of_handover == "cif" ||
                offersLoop?.terms_of_handover == "loco_luar_pulau" ||
                offersLoop?.terms_of_handover == "fob"
              ) {
                if (!logisticOfferOnlyShip[0]?.finalhoverqtotox) {
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyShip[0]?.finalhoverqtotox)
                    .style(styles.Numeric.Plain);
                }
              } else if (offersLoop?.terms_of_handover == "loco_dalam_pulau") {
                if (!logisticOfferOnlyDTruck[0]?.finalhoverqtotox) {
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyDTruck[0]?.finalhoverqtotox)
                    .style(styles.Numeric.Plain);
                }
              }
            }
            if (col == 89) {
              console.log("colCK");
              if (offersLoop?.terms_of_handover == "franco") {
                if (!logisticOfferOnlyFranco[0]?.final_qtotox) {
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyFranco[0]?.final_qtotox)
                    .style(styles.Numeric.Plain);
                }
              } else if (
                offersLoop?.terms_of_handover == "cif" ||
                offersLoop?.terms_of_handover == "loco_luar_pulau" ||
                offersLoop?.terms_of_handover == "fob"
              ) {
                if (!logisticOfferOnlyShip[0]?.final_qtotox) {
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyShip[0]?.final_qtotox)
                    .style(styles.Numeric.Plain);
                }
              } else if (offersLoop?.terms_of_handover == "loco_dalam_pulau") {
                if (!logisticOfferOnlyDTruck[0]?.final_qtotox) {
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyDTruck[0]?.final_qtotox)
                    .style(styles.Numeric.Plain);
                }
              }
            }
            if (col == 90) {
              console.log("colCL");
              if (offersLoop?.terms_of_handover == "franco") {
                if (!logisticOfferOnlyFranco[0]?.finalhoverqiv) {
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyFranco[0]?.finalhoverqiv)
                    .style(styles.Numeric.Plain);
                }
              } else if (
                offersLoop?.terms_of_handover == "cif" ||
                offersLoop?.terms_of_handover == "loco_luar_pulau" ||
                offersLoop?.terms_of_handover == "fob"
              ) {
                if (!logisticOfferOnlyShip[0]?.finalhoverqiv) {
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyShip[0]?.finalhoverqiv)
                    .style(styles.Numeric.Plain);
                }
              } else if (offersLoop?.terms_of_handover == "loco_dalam_pulau") {
                if (!logisticOfferOnlyDTruck[0]?.finalhoverqiv) {
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyDTruck[0]?.finalhoverqiv)
                    .style(styles.Numeric.Plain);
                }
              }
            }
            if (col == 91) {
              console.log("colCM");
              if (offersLoop?.terms_of_handover == "franco") {
                if (!logisticOfferOnlyFranco[0]?.final_qiv) {
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyFranco[0]?.final_qiv)
                    .style(styles.Numeric.Plain);
                }
              } else if (
                offersLoop?.terms_of_handover == "cif" ||
                offersLoop?.terms_of_handover == "loco_luar_pulau" ||
                offersLoop?.terms_of_handover == "fob"
              ) {
                if (!logisticOfferOnlyShip[0]?.final_qiv) {
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyShip[0]?.final_qiv)
                    .style(styles.Numeric.Plain);
                }
              } else if (offersLoop?.terms_of_handover == "loco_dalam_pulau") {
                if (!logisticOfferOnlyDTruck[0]?.final_qiv) {
                } else {
                  sheetOffer
                    .cell(row, col)
                    .number(logisticOfferOnlyDTruck[0]?.final_qiv)
                    .style(styles.Numeric.Plain);
                }
              }
            }
          }
        }
        counterMundur--;
        startRow++;
      }
      logisticOfferIdInOneOffer = removeItemOnce(
        logisticOfferIdInOneOffer,
        logisticOfferIdInOneOffer.length - counterMundur
      );
    } else {
      let counterMundur = logisticOfferIdInOneOffer.length;
      for (
        let row = startRow;
        row < startRow + addRowEveryTransportirInOneOffer + 1;
        row++
      ) {
        for (let col = 1; col <= 100; col++) {
          //colA

          if (col == 1) {
            console.log("2colA");
            sheetOffer
              .cell(row, col)
              .string(
                `${parseInt(key) + 1}${
                  counterMundur <= logisticOfferIdInOneOffer.length
                    ? "S".repeat(
                        logisticOfferIdInOneOffer.length - counterMundur
                      )
                    : ""
                }`
              )
              .style(styles.Number.Plain);
          }

          //colB
          if (col == 2) {
            console.log("2colB");

            if (!offersLoop?.datetime) {
              sheetOffer.cell(row, col).string("").style(styles.String.Plain);
            } else
              sheetOffer
                .cell(row, col)
                .date(`${parsingDateToIndoFormat(offersLoop?.datetime)}`)
                .style(styles.Date.Plain);
          }
          //colC

          if (col == 3) {
            sheetOffer
              .cell(row, col)
              .string(
                `${!offersLoop?.spplr.name ? "" : offersLoop?.spplr.name}`
              )
              .style(styles.String.Plain);
          }
          if (col == 3) {
            //colC
            console.log("2colC");
            sheetOffer
              .cell(row, col)
              .string(
                `${!offersLoop?.spplr.name ? "" : offersLoop?.spplr.name}`
              )
              .style(styles.String.Plain);
          }

          if (col == 4) {
            //colD
            console.log("2colD");
            sheetOffer
              .cell(row, col)
              .string(`${offersLoop?.po_number ?? offersLoop?.id}`)
              .style(styles.String.Plain);
          }
          if (col == 5) {
            //colE
            console.log("2colE");
            sheetOffer
              .cell(row, col)
              .string(
                `${
                  !offersLoop?.contract_number
                    ? ""
                    : offersLoop?.contract_number
                }`
              )
              .style(styles.String.Plain);
          }
          if (col == 6) {
            //colF
            console.log("2colF");
            sheetOffer
              .cell(row, col)
              .string(
                `${
                  monthMapping[
                    parsingDateToString(offersLoop?.datetime).split("-")[1]
                  ] +
                  " " +
                  parsingDateToString(offersLoop?.datetime).split("-")[0]
                }`
              )
              .style(styles.String.Plain);
          }
          if (col == 7) {
            //colG
            console.log("2colG");
            sheetOffer.addDataValidation({
              type: "list",
              allowBlank: true,
              prompt: "Choose week",
              errorTitle: "Invalid Option",
              error: "Select Option from Dropdown",
              showDropDown: true,
              sqref: `G${row}:G${row}`,
              formulas: ["W1,W2,W3,W4,W5"],
            });
            sheetOffer
              .cell(row, col)
              .string(`${!offersLoop?.week ? "" : offersLoop?.week}`)
              .style(styles.String.Plain);
          }
          if (col == 8) {
            //colH
            console.log("2colH");

            if (!offersLoop?.price_insurance) {
              emptyCell(row, col);
            } else {
              sheetOffer
                .cell(row, col)
                .number(offersLoop?.price_insurance)
                .style(styles.Numeric.Plain);
            }
          }
          if (col == 9) {
            console.log("2colI");
            //colI
            if (!offersLoop?.price_freight) {
              emptyCell(row, col);
            } else {
              sheetOffer
                .cell(row, col)
                .number(offersLoop?.price_freight)
                .style(styles.Numeric.Plain);
            }
          }

          if (col == 10) {
            console.log("2colJ");
            //colJ
            if (!offersLoop?.price_susut) {
              emptyCell(row, col);
            } else {
              sheetOffer
                .cell(row, col)
                .number(parseInt(`${offersLoop?.price_susut}`))
                .style(styles.Number.Plain);
            }
          }

          if (col == 11) {
            console.log("2colK");
            //colK
            if (!offersLoop?.price_cof) {
              emptyCell(row, col);
            } else {
              sheetOffer
                .cell(row, col)
                .number(parseInt(`${offersLoop?.price_cof}`))
                .style(styles.Number.Plain);
            }
          }

          if (col == 12) {
            console.log("2colL");
            //colL
            if (logisticOfferOnlyLTruck.length == 0) {
              emptyCell(row, col);
            } else {
              sheetOffer
                .cell(row, col)
                .number(parseInt(`${logisticOfferOnlyLTruck[0].price}`))
                .style(styles.Number.Plain);
            }
          }

          if (col == 13) {
            console.log("2colM");

            sheetOffer
              .cell(row, col)
              .number(
                parseFloat(
                  `${!offersLoop?.price ? 0 : offersLoop?.price.toFixed(2)}`
                )
              )
              .style(styles.RupiahPrice.Plain);
          }

          if (col == 14) {
            console.log("2colN");
            //colN

            sheetOffer
              .cell(row, col)
              .number(
                parseInt(
                  `${
                    offersLoop?.lOffers.length == 0
                      ? offersLoop?.terms_of_handover == "franco" ||
                        offersLoop?.terms_of_handover == "loco_dalam_pulau"
                        ? offersLoop?.quantity
                        : offersLoop?.quantity
                      : logisticOfferOnlyLTruck[0].quantity
                  }`
                ) * 1000
              )
              .style(styles.Numeric.Plain);
          }

          if (col == 15) {
            console.log("2colO");
            //colO
            let formula = `M${row}*N${row}`;

            sheetOffer
              .cell(row, col)
              .formula(formula)
              .style(styles.RupiahPriceValue.Plain);
          }

          if (col == 16) {
            console.log("2colP");
            //ok
            //colP
            sheetOffer
              .cell(row, col)
              .number(
                parseFloat(
                  `${
                    !offersLoop?.price_exclude ? 0 : offersLoop?.price_exclude
                  }`
                ).toFixed(2) * 1.11
              )
              .style(styles.RupiahPrice.Plain);
          }

          if (col == 17) {
            console.log("2colQ");
            //colQ
            let formula = `P${row}*N${row}`;
            sheetOffer
              .cell(row, col)
              .formula(formula)
              .style(styles.RupiahPriceValue.Plain);
          }

          if (col == 18) {
            console.log("2colR");
            //colR

            if (!offersLoop?.price_final) {
              emptyCell(row, col);
            } else {
              sheetOffer
                .cell(row, col)
                .number(
                  parseFloat(
                    `${
                      !offers[key].kpb_include
                        ? 0
                        : offers[key].kpb_include.toFixed(2)
                    }`
                  )
                )
                .style(styles.RupiahPrice.Plain);
            }
          }

          if (col == 19) {
            console.log("2colS");
            //colS
            if (!offersLoop?.price_final) {
              emptyCell(row, col);
            } else {
              let formula = `R${row}*N${row}`;
              sheetOffer
                .cell(row, col)
                .formula(formula)
                .style(styles.RupiahPriceValue.Plain);
            }
          }

          if (col == 20) {
            console.log("2colT");
            //colT
            sheetOffer
              .cell(row, col)
              .string(
                `${!offersLoop?.whs ? "" : offersLoop?.whs.name.split(" ")[1]}`
              )
              .style(styles.String.Plain);
          }

          if (col == 21) {
            console.log("2colU");
            //colU

            const getETA = offersLoop?.eta_to.getDate() < 15 ? "1ST" : "2ND";
            const getETAMonth = offersLoop?.eta_to.getMonth() + 1;
            sheetOffer
              .cell(row, col)
              .string(`${getETA} ${monthMapETA[getETAMonth]}`)
              .style(styles.Date.Plain);
          }

          if (col == 22) {
            console.log("2colV");
            //colV
            sheetOffer
              .cell(row, col)
              .number(parseInt(`${offersLoop?.quality_ffa}`))
              .style(styles.Numeric.Plain);
          }

          if (col == 23) {
            console.log("2colW");
            //colW
            let formula = `V${row}*N${row}`;
            sheetOffer
              .cell(row, col)
              .formula(formula)
              .style(styles.Numeric.Plain);
          }

          if (col == 24) {
            console.log("2colX");
            //colX

            sheetOffer
              .cell(row, col)
              .string(
                `${
                  constant.TERMS_OF_HANDOVER_TO_PO_MAP[
                    offersLoop?.terms_of_handover
                  ]
                }`
              )
              .style(styles.String.Plain);
          }

          if (col == 25) {
            console.log("2colY");
            //colY

            let firstName =
              offersLoop?.dealer.name.length > 1
                ? offersLoop?.dealer.name.split(" ")[0]
                : offersLoop?.dealer.name;

            sheetOffer
              .cell(row, col)
              .string(firstName)
              .style(styles.String.Plain);
          }
          if (col == 26) {
            console.log("2colZ");

            //colZ

            sheetOffer
              .cell(row, col)
              .string(
                `${
                  offersLoop?.terms_of_handover == "franco" ||
                  offersLoop?.terms_of_handover == "cif" ||
                  offersLoop?.terms_of_handover == "loco_dalam_pulau"
                    ? constant.TERMS_OF_HANDOVER_TO_PO_MAP[
                        offersLoop?.terms_of_handover
                      ]
                    : !offersLoop?.hOver_Loc
                    ? ""
                    : offersLoop?.hOver_Loc.name
                }`
              )
              .style(styles.String.Plain);
          }
        }
        counterMundur--;
      }

      startRow = startRow + addRowEveryTransportirInOneOffer + 1;
    }

    addRowEveryTransportirInOneOffer = 0;
    logisticOfferIdInOneOffer = [];
    logisticOfferOnlyLTruck = [];
    logisticOfferOnlyShip = [];
    logisticOfferOnlyDTruck = [];
    countingRowLoop++;
  }
  return sheetOffer;
};

export const ConstructHeaderBudgetFreightV2 = async (ws, styles) => {
  let budgetFreightSheetOffer = ws;

  budgetFreightSheetOffer
    .cell(1, 2, 1, 6, true)
    .string("LIST BUDGET FREIGHT KAPAL")
    .style(styles.TableHead.Plain);
  budgetFreightSheetOffer.column(2).setWidth(64 / 8);
  budgetFreightSheetOffer.column(3).setWidth(97 / 8);
  budgetFreightSheetOffer.column(4).setWidth(109 / 8);
  budgetFreightSheetOffer.column(5).setWidth(167 / 8);
  budgetFreightSheetOffer.column(6).setWidth(99 / 8);

  budgetFreightSheetOffer
    .cell(3, 2)
    .string("No")
    .style(styles.TableHead.Bordered);
  budgetFreightSheetOffer
    .cell(3, 3)
    .string("Loading Port")
    .style(styles.TableHead.Bordered);
  budgetFreightSheetOffer
    .cell(3, 4)
    .string("Discharging Port")
    .style(styles.TableHead.Bordered);
  budgetFreightSheetOffer
    .cell(3, 5)
    .string("Dummy")
    .style(styles.TableHead.Bordered);
  budgetFreightSheetOffer
    .cell(3, 6)
    .string("Budget Freight")
    .style(styles.TableHead.Bordered);

  budgetFreightSheetOffer
    .cell(1, 11, 1, 15, true)
    .string("LIST BUDGET FREIGHT ANGKUTAN DARAT")
    .style(styles.TableHead.Plain);
  budgetFreightSheetOffer.column(11).setWidth(64 / 8);
  budgetFreightSheetOffer.column(12).setWidth(97 / 8);
  budgetFreightSheetOffer.column(13).setWidth(109 / 8);
  budgetFreightSheetOffer.column(14).setWidth(167 / 8);
  budgetFreightSheetOffer.column(15).setWidth(99 / 8);

  budgetFreightSheetOffer
    .cell(3, 11)
    .string("No")
    .style(styles.TableHead.Bordered);
  budgetFreightSheetOffer
    .cell(3, 12)
    .string("Port")
    .style(styles.TableHead.Bordered);
  budgetFreightSheetOffer
    .cell(3, 13)
    .string("Plant")
    .style(styles.TableHead.Bordered);
  budgetFreightSheetOffer
    .cell(3, 14)
    .string("RUTE ANGKUTAN")
    .style(styles.TableHead.Bordered);
  budgetFreightSheetOffer
    .cell(3, 15)
    .string("Budget Freight")
    .style(styles.TableHead.Bordered);

  return budgetFreightSheetOffer;
};

export const ConstructBodyBudgetFreightV2 = async (
  ws,
  styles,
  budgetKapal,
  budgetTruk
) => {
  let budgetFreightSheetOffer = ws;
  const startRow = 4;

  for (let row = startRow; row < budgetKapal.length + startRow; row++) {
    for (
      let col = 1;
      col <= Object.keys(budgetFreightColumnMapping).length;
      col++
    ) {
      if (col == 2) {
        budgetFreightSheetOffer
          .cell(row, col)
          .string(`${row - startRow + 1}`)
          .style(styles.Number.Plain);
      }
      if (col == 3) {
        budgetFreightSheetOffer
          .cell(row, col)
          .string(
            `${
              !budgetKapal[row - startRow].hOver_loc
                ? ""
                : budgetKapal[row - startRow].hOver_loc.name
            }`
          )
          .style(styles.Number.Plain);
      }
      if (col == 4) {
        budgetFreightSheetOffer
          .cell(row, col)
          .string(
            `${
              !budgetKapal[row - startRow].dstn_loc
                ? ""
                : budgetKapal[row - startRow].dstn_loc.name
            }`
          )
          .style(styles.Number.Plain);
      }
      if (col == 5) {
        let formula = `C${row}&D${row}`;
        budgetFreightSheetOffer
          .cell(row, col)
          .formula(formula)
          .style(styles.Number.Plain);
      }
      if (col == 6) {
        budgetFreightSheetOffer
          .cell(row, col)
          .string(`${budgetKapal[row - startRow].budget}`)
          .style(styles.Number.Plain);
      }
    }
  }

  for (let row = startRow; row < budgetTruk.length + startRow; row++) {
    for (
      let col = 1;
      col <= Object.keys(budgetFreightColumnMapping).length;
      col++
    ) {
      if (col == 11) {
        budgetFreightSheetOffer
          .cell(row, col)
          .string(`${row - startRow + 1}`)
          .style(styles.Number.Plain);
      }
      if (col == 12) {
        budgetFreightSheetOffer
          .cell(row, col)
          .string(
            `${
              !budgetTruk[row - startRow].hOver_loc
                ? ""
                : budgetTruk[row - startRow].hOver_loc.name
            }`
          )
          .style(styles.Number.Plain);
      }
      if (col == 13) {
        budgetFreightSheetOffer
          .cell(row, col)
          .string(
            `${
              !budgetTruk[row - startRow].dstn_loc
                ? ""
                : budgetTruk[row - startRow].dstn_loc.name
            }`
          )
          .style(styles.Number.Plain);
      }
      if (col == 14) {
        let formula = `L${row}&M${row}`;
        budgetFreightSheetOffer
          .cell(row, col)
          .formula(formula)
          .style(styles.Number.Plain);
      }
      if (col == 15) {
        budgetFreightSheetOffer
          .cell(row, col)
          .string(`${budgetTruk[row - startRow].budget}`)
          .style(styles.Number.Plain);
      }
    }
  }
  return budgetFreightSheetOffer;
};

function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}
