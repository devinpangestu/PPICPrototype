export const initStyles = (wb) => {
  const border = {
    style: "thin",
    color: "#000000",
  };
  const styles = {
    Heading: {
      Plain: wb.createStyle({
        font: { size: 16 },
        alignment: { vertical: "center" },
      }),
      Bordered: wb.createStyle({
        font: { size: 16 },
        alignment: { vertical: "center" },
        border: {
          left: border,
          top: border,
          right: border,
          bottom: border,
        },
      }),
    },
    DateTime: {
      Plain: wb.createStyle({
        font: { size: 10, name: "Arial" },
        numberFormat: "dd/mm/yyyy hh:mm:ss",
        alignment: { horizontal: "center", vertical: "center" },
      }),
      Bordered: wb.createStyle({
        numberFormat: "dd/mm/yyyy hh:mm:ss",
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          left: border,
          top: border,
          right: border,
          bottom: border,
        },
      }),
    },
    Date: {
      Plain: wb.createStyle({
        font: { size: 10, name: "Arial" },
        numberFormat: "dd/mm/yyyy",
        alignment: { horizontal: "center", vertical: "center" },
      }),
      Bordered: wb.createStyle({
        numberFormat: "dd/mm/yyyy",
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          left: border,
          top: border,
          right: border,
          bottom: border,
        },
      }),
    },
    RupiahPrice: {
      Plain: wb.createStyle({
        font: { size: 10, name: "Arial" },
        numberFormat: "Rp #,##0.00",
        alignment: { vertical: "center" },
      }),
      Bordered: wb.createStyle({
        numberFormat: "Rp #,##0.00",
        alignment: { vertical: "center" },
        border: {
          left: border,
          top: border,
          right: border,
          bottom: border,
        },
      }),
    },
    RupiahPriceValue: {
      Plain: wb.createStyle({
        font: { size: 10, name: "Arial" },
        numberFormat: "Rp #,##0",
        alignment: { vertical: "center" },
      }),
      Bordered: wb.createStyle({
        numberFormat: "Rp #,##0",
        alignment: { vertical: "center" },
        border: {
          left: border,
          top: border,
          right: border,
          bottom: border,
        },
      }),
    },
    Price: {
      Plain: wb.createStyle({
        font: { size: 10, name: "Arial" },
        numberFormat: "#,##0.00",
        alignment: { vertical: "center" },
      }),
      Bordered: wb.createStyle({
        numberFormat: "#,##0.00",
        alignment: { vertical: "center" },
        border: {
          left: border,
          top: border,
          right: border,
          bottom: border,
        },
      }),
    },
    NumberWithDot: {
      Plain: wb.createStyle({
        font: { size: 10, name: "Arial" },
        numberFormat: "#,##0",
        alignment: { vertical: "center" },
      }),
      Bordered: wb.createStyle({
        numberFormat: "#,##0",
        alignment: { vertical: "center" },
        border: {
          left: border,
          top: border,
          right: border,
          bottom: border,
        },
      }),
    },
    String: {
      Plain: wb.createStyle({
        font: { size: 10, name: "Arial" },
        alignment: { horizontal: "center", vertical: "center" },
      }),
      Bordered: wb.createStyle({
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          left: border,
          top: border,
          right: border,
          bottom: border,
        },
      }),
    },
    CustomTableHeadOfferDetail: {
      Plain: wb.createStyle({
        font: { bold: true },

        alignment: { horizontal: "center", vertical: "center" },
      }),
      Bordered: wb.createStyle({
        font: { bold: true },
        alignment: { horizontal: "center", vertical: "center" },
        fill: {
          type: "pattern", // the only one implemented so far.
          patternType: "solid", // most common.
          fgColor: "ffe699",
        },
        border: {
          left: border,
          top: border,
          right: border,
          bottom: border,
        },
      }),
    },
    CustomTableHeadLoadDischPort: {
      Plain: wb.createStyle({
        font: { bold: true },

        alignment: { horizontal: "center", vertical: "center" },
      }),
      Bordered: wb.createStyle({
        font: { bold: true },
        alignment: { horizontal: "center", vertical: "center" },
        fill: {
          type: "pattern", // the only one implemented so far.
          patternType: "solid", // most common.
          fgColor: "C65911",
        },
        border: {
          left: border,
          top: border,
          right: border,
          bottom: border,
        },
      }),
    },
    CustomTableHeadSuppKapal: {
      Plain: wb.createStyle({
        font: { bold: true },

        alignment: { horizontal: "center", vertical: "center" },
      }),
      Bordered: wb.createStyle({
        font: { bold: true },
        alignment: { horizontal: "center", vertical: "center" },
        fill: {
          type: "pattern", // the only one implemented so far.
          patternType: "solid", // most common.
          fgColor: "2F75B5",
        },
        border: {
          left: border,
          top: border,
          right: border,
          bottom: border,
        },
      }),
    },
    CustomTableHeadBudgetTruck: {
      Plain: wb.createStyle({
        font: { bold: true },

        alignment: { horizontal: "center", vertical: "center" },
      }),
      Bordered: wb.createStyle({
        font: { bold: true },
        alignment: { horizontal: "center", vertical: "center" },
        fill: {
          type: "pattern", // the only one implemented so far.
          patternType: "solid", // most common.
          fgColor: "7030A0",
        },
        border: {
          left: border,
          top: border,
          right: border,
          bottom: border,
        },
      }),
    },
    CustomTableHeadBAST: {
      Plain: wb.createStyle({
        font: { bold: true },

        alignment: { horizontal: "center", vertical: "center" },
      }),
      Bordered: wb.createStyle({
        font: { bold: true },
        alignment: { horizontal: "center", vertical: "center" },
        fill: {
          type: "pattern", // the only one implemented so far.
          patternType: "solid", // most common.
          fgColor: "548235",
        },
        border: {
          left: border,
          top: border,
          right: border,
          bottom: border,
        },
      }),
    },
    TableHead: {
      Plain: wb.createStyle({
        font: { size: 10, name: "Arial" },

        alignment: { horizontal: "center", vertical: "center" },
      }),
      Bordered: wb.createStyle({
        font: { bold: true, size: 11, name: "Calibri" },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          left: border,
          top: border,
          right: border,
          bottom: border,
        },
      }),
      BorderedOfferDetail: wb.createStyle({
        font: { bold: true, size: 11 },
        fill: {
          type: "none", // the only one implemented so far.
          patternType: "solid", // most common.
          fgColor: "#ffe699",
        },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          left: border,
          top: border,
          right: border,
          bottom: border,
        },
      }),
    },
    Text: {
      Plain: wb.createStyle({
        font: { size: 10, name: "Arial" },
        alignment: { wrapText: true, vertical: "center" },
      }),
      Bordered: wb.createStyle({
        alignment: { wrapText: true, vertical: "center" },
        border: {
          left: border,
          top: border,
          right: border,
          bottom: border,
        },
      }),
    },
    Numeric: {
      Plain: wb.createStyle({
        font: { size: 10, name: "Arial" },
        numberFormat: "@",
        alignment: { vertical: "center" },
      }),
      Bordered: wb.createStyle({
        numberFormat: "@",
        alignment: { vertical: "center" },
        border: {
          left: border,
          top: border,
          right: border,
          bottom: border,
        },
      }),
    },
    Number: {
      Plain: wb.createStyle({
        font: { size: 10, name: "Arial" },
        numberFormat: "0",
        alignment: { horizontal: "center", vertical: "center" },
      }),
      Bordered: wb.createStyle({
        numberFormat: "0",
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          left: border,
          top: border,
          right: border,
          bottom: border,
        },
      }),
    },
    Percent: {
      Plain: wb.createStyle({
        numberFormat: "0%",
        alignment: { horizontal: "center", vertical: "center" },
      }),
      Bordered: wb.createStyle({
        numberFormat: "0%",
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          left: border,
          top: border,
          right: border,
          bottom: border,
        },
      }),
    },
    EmptyProgressive: {
      Plain: wb.createStyle({
        font: { size: 10, name: "Arial" },
        numberFormat: "#.##0,00;#;-",
        alignment: { horizontal: "center", vertical: "center" },
      }),
      Bordered: wb.createStyle({
        numberFormat: "#.##0,00;#;-",
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          left: border,
          top: border,
          right: border,
          bottom: border,
        },
      }),
    },
  };

  return styles;
};

export default initStyles;
