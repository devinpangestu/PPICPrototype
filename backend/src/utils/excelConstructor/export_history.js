import { parsingDateToString, parsingDateToIndoFormat } from "../parsing.js";

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

export const ConstructHeaderHistory = async (ws, styles) => {
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
    .string("QTY REALISASI (BL)")
    .style(styles.CustomTableHeadLoadDischPort.Bordered);
  sheetOffer
    .cell(1, 32)
    .string("TGL BAST MUAT")
    .style(styles.CustomTableHeadLoadDischPort.Bordered);
  sheetOffer
    .cell(1, 33)
    .string("TGL MULAI MUAT")
    .style(styles.CustomTableHeadLoadDischPort.Bordered);
  sheetOffer
    .cell(1, 34)
    .string("TGL SELESAI MUAT")
    .style(styles.CustomTableHeadLoadDischPort.Bordered);
  sheetOffer
    .cell(1, 35)
    .string("WAKTU KEGIATAN MUAT")
    .style(styles.CustomTableHeadLoadDischPort.Bordered);

  sheetOffer
    .cell(1, 36)
    .string("QTY BAST MUAT")
    .style(styles.CustomTableHeadLoadDischPort.Bordered);

  sheetOffer
    .cell(1, 37)
    .string("NO GR RECEIVING")
    .style(styles.CustomTableHeadLoadDischPort.Bordered);
  sheetOffer
    .cell(1, 38)
    .string("QTY GR RECEIVING")
    .style(styles.CustomTableHeadLoadDischPort.Bordered);
  sheetOffer
    .cell(1, 39)
    .string("TGL BR")
    .style(styles.CustomTableHeadLoadDischPort.Bordered);
  sheetOffer
    .cell(1, 40)
    .string("QTY BR")
    .style(styles.CustomTableHeadLoadDischPort.Bordered);
  sheetOffer
    .cell(1, 41)
    .string("QTY BR2")
    .style(styles.CustomTableHeadSuppKapal.Bordered);

  sheetOffer
    .cell(1, 42)
    .string("RUTE ANGKUT TRUCKING")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 43)
    .string("BUDGET TRUCKING")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer
    .cell(1, 44)
    .string("AVG ACTUAL TRUCKING")
    .style(styles.CustomTableHeadBudgetTruck.Bordered);
  sheetOffer.column(3).freeze();
  return sheetOffer;
};

export const ConstructBodyHistory = async (ws, styles, offers) => {
  const sheetOffer = ws;
  const startRow = 2;

  let addRowEveryTransportirInOneOffer = 0;
  let countingRowLoop = 0;
  for (let key in offers) {
    if (
      offers[key].Offer.offer.logistic_offers.length == 0 ||
      offers[key].Offer.offer.logistic_offers.length == 1
    ) {
    } else {
      addRowEveryTransportirInOneOffer +=
        offers[key].Offer.offer.logistic_offers.length - 1;
    }
  }

  let countLogisticOfferArray = 0;

  for (
    let row = startRow;
    row < offers.length + startRow + addRowEveryTransportirInOneOffer;
    row++
  ) {
    let offersLoop = offers[row - startRow - countingRowLoop].Offer.offer;
    let logisticOffers = offersLoop.logistic_offers;
    let counterMundur = logisticOffers.length;
    countLogisticOfferArray++;

    for (let col = 1; col <= Object.keys(columnMapping).length; col++) {
      //colA

      if (col == 1) {
        sheetOffer
          .cell(row, col)
          .string(
            `${row - startRow - countingRowLoop + 1}${
              counterMundur > 1 ? "S".repeat(countLogisticOfferArray - 1) : ""
            }`
          )
          .style(styles.Number.Plain);
      }
      //colB
      if (col == 2) {
        sheetOffer
          .cell(row, col)
          .date(`${parsingDateToIndoFormat(offersLoop.datetime)}`)
          .style(styles.Date.Plain);
      }
      //colC

      if (col == 3) {
        sheetOffer
          .cell(row, col)
          .string(
            `${!offersLoop.supplier.name ? "" : offersLoop.supplier.name}`
          )
          .style(styles.String.Plain);
      }
      //colD
      if (col == 4) {
        sheetOffer
          .cell(row, col)
          .string(`${!offersLoop.id ? "" : offersLoop.id}`)
          .style(styles.String.Plain);
      }
      //colE
      if (col == 5) {
        sheetOffer
          .cell(row, col)
          .string(
            `${!offersLoop.commodity.name ? "" : offersLoop.commodity.name}`
          )
          .style(styles.String.Plain);
      }
      //colF
      if (col == 6) {
        sheetOffer
          .cell(row, col)
          .string(
            `${
              monthMapping[
                parsingDateToString(offersLoop.datetime).split("-")[1]
              ] +
              " " +
              parsingDateToString(offersLoop.datetime).split("-")[0]
            }`
          )
          .style(styles.String.Plain);
      }
      //colG
      if (col == 7) {
        sheetOffer
          .cell(row, col)
          .string(`${!offersLoop.hOver_Loc ? "" : offersLoop.hOver_Loc.name}`)
          .style(styles.String.Plain);
      }
      //colH
      if (col == 8) {
        if (!offersLoop.price_insurance) {
          sheetOffer.cell(row, col).string("").style(styles.Number.Plain);
        } else {
          sheetOffer
            .cell(row, col)
            .number(parseInt(`${offersLoop.price_insurance}`))
            .style(styles.Number.Plain);
        }
      }

      if (col == 9) {
        //colI
        if (!offersLoop.price_freight) {
          sheetOffer.cell(row, col).string("").style(styles.Number.Plain);
        } else {
          sheetOffer
            .cell(row, col)
            .number(parseInt(`${offersLoop.price_freight}`))
            .style(styles.Number.Plain);
        }
      }

      if (col == 10) {
        //colJ
        if (!offersLoop.price_susut) {
          sheetOffer.cell(row, col).string("").style(styles.Number.Plain);
        } else {
          sheetOffer
            .cell(row, col)
            .number(parseInt(`${offersLoop.price_susut}`))
            .style(styles.Number.Plain);
        }
      }

      if (col == 11) {
        //colK
        if (!offersLoop.price_cof) {
          sheetOffer.cell(row, col).string("").style(styles.Number.Plain);
        } else {
          sheetOffer
            .cell(row, col)
            .number(parseInt(`${offersLoop.price_cof}`))
            .style(styles.Number.Plain);
        }
      }

      if (col == 12) {
        //colL
        if (!offersLoop.price) {
          sheetOffer.cell(row, col).string("").style(styles.Number.Plain);
        } else {
          sheetOffer
            .cell(row, col)
            .number(parseInt(`0`))
            .style(styles.Number.Plain);
        }
      }

      if (col == 13) {
        //ok
        //colM
        // let formula = `P${row}+SUM(H${row}:L${row})`;
        // sheetOffer.cell(row, col).formula(formula).style(styles.Price.Plain);

        sheetOffer
          .cell(row, col)
          .number(
            parseFloat(`${!offersLoop.price ? 0 : offersLoop.price.toFixed(2)}`)
          )
          .style(styles.RupiahPrice.Plain);
      }

      if (col == 14) {
        //colN

        sheetOffer
          .cell(row, col)
          .number(
            parseInt(
              `${
                logisticOffers.length == 0
                  ? offersLoop.terms_of_handover == "franco"
                    ? offersLoop.quantity
                    : offersLoop.quantity
                  : logisticOffers[countLogisticOfferArray - 1].quantity
              }`
            ) * 1000
          )
          .style(styles.Numeric.Plain);
      }

      if (col == 15) {
        //colO
        let formula = `M${row}*N${row}`;

        sheetOffer
          .cell(row, col)
          .formula(formula)
          .style(styles.RupiahPriceValue.Plain);
      }

      if (col == 16) {
        //ok
        //colP
        sheetOffer
          .cell(row, col)
          .number(
            parseFloat(
              `${!offersLoop.price_exclude ? 0 : offersLoop.price_exclude}`
            ).toFixed(2) * 1.11
          )
          .style(styles.RupiahPrice.Plain);
      }

      if (col == 17) {
        //colQ
        let formula = `P${row}*N${row}`;
        sheetOffer
          .cell(row, col)
          .formula(formula)
          .style(styles.RupiahPriceValue.Plain);
      }

      if (col == 18) {
        //colR

        if (!offersLoop.price_final) {
          sheetOffer.cell(row, col).string("").style(styles.Number.Plain);
        } else {
          sheetOffer
            .cell(row, col)
            .number(
              parseFloat(
                `${
                  !offers[row - startRow - countingRowLoop].kpb_include
                    ? 0
                    : offers[
                        row - startRow - countingRowLoop
                      ].kpb_include.toFixed(2)
                }`
              )
            )
            .style(styles.RupiahPrice.Plain);
        }
      }

      if (col == 19) {
        //colS
        if (!offersLoop.price_final) {
          sheetOffer.cell(row, col).string("").style(styles.Number.Plain);
        } else {
          let formula = `R${row}*N${row}`;
          sheetOffer
            .cell(row, col)
            .formula(formula)
            .style(styles.RupiahPriceValue.Plain);
        }
      }

      if (col == 20) {
        //colT
        sheetOffer
          .cell(row, col)
          .string(
            `${
              !offersLoop.warehouse
                ? ""
                : offersLoop.warehouse.name.split(" ")[1]
            }`
          )
          .style(styles.String.Plain);
      }

      if (col == 21) {
        //colU
        sheetOffer
          .cell(row, col)
          .date(`${parsingDateToIndoFormat(offersLoop.eta_to)}`)
          .style(styles.Date.Plain);
      }

      if (col == 22) {
        //colV
        sheetOffer
          .cell(row, col)
          .number(parseInt(`${offersLoop.quality_ffa}`))
          .style(styles.Numeric.Plain);
      }

      if (col == 23) {
        //colW
        let formula = `V${row}*N${row}`;
        sheetOffer.cell(row, col).formula(formula).style(styles.Numeric.Plain);
      }

      if (col == 24) {
        //colX
        sheetOffer
          .cell(row, col)
          .string(`${offersLoop.terms_of_handover}`)
          .style(styles.String.Plain);
      }

      if (col == 25) {
        //colY
        let firstName =
          offersLoop.dealer.name.length > 1
            ? offers[
                row - startRow - countingRowLoop
              ].Offer.offer.dealer.name.split(" ")[0]
            : offersLoop.dealer.name;

        sheetOffer.cell(row, col).string(firstName).style(styles.String.Plain);
      }
      if (col == 26) {
        //colZ
        sheetOffer
          .cell(row, col)
          .string(
            `${
              offersLoop.terms_of_handover == "franco" ||
              offersLoop.terms_of_handover == "cif"
                ? offersLoop.terms_of_handover
                : !offersLoop.hOver_Loc
                ? ""
                : offersLoop.hOver_Loc.name
            }`
          )
          .style(styles.String.Plain);
      }
      if (col == 27) {
        //colAA
        sheetOffer
          .cell(row, col)
          .string(
            `${
              !offersLoop.warehouse
                ? ""
                : offersLoop.warehouse.name.split(" ")[1]
            }`
          )
          .style(styles.String.Plain);
      }
      if (col == 28) {
        //colAB
        let formula = `Z${row}&AA${row}`;
        sheetOffer.cell(row, col).formula(formula).style(styles.String.Plain);
      }
      if (col == 29) {
        //colAC
        sheetOffer
          .cell(row, col)
          .date(`${parsingDateToIndoFormat(offersLoop.handover_date_to)}`)
          .style(styles.Date.Plain);
      }
      if (col == 30) {
        //colAD

        sheetOffer
          .cell(row, col)
          .string(
            `${
              logisticOffers.length == 0
                ? ""
                : !logisticOffers[countLogisticOfferArray - 1].delivery_date
                ? ""
                : parsingDateToIndoFormat(
                    logisticOffers[countLogisticOfferArray - 1].delivery_date
                  )
            }`
          )
          .style(styles.String.Plain);
      }
    }

    counterMundur--;

    if (logisticOffers.length == 0 || logisticOffers.length == 1) {
      countLogisticOfferArray = 0;
    } else {
      if (logisticOffers.length == countLogisticOfferArray) {
        countLogisticOfferArray = 0;
        countingRowLoop--;
      }

      countingRowLoop++;
    }
  }
  return sheetOffer;
};

export const ConstructHeaderBudgetFreight = async (ws, styles) => {
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

export const ConstructBodyBudgetFreight = async (
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
              !budgetKapal[row - startRow].handover_location
                ? ""
                : budgetKapal[row - startRow].handover_location.name
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
              !budgetTruk[row - startRow].handover_location
                ? ""
                : budgetTruk[row - startRow].handover_location.name
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
