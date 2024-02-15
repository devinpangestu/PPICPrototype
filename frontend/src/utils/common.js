import constant from "constant";
import moment from "moment";

export const havePermission = (userPermissions, ...neededPermission) => {
  if (neededPermission.length > 0) {
    if (!neededPermission.every((val) => userPermissions.includes(val))) {
      // permissions not exist
      return false;
    }
  }

  return true;
};

export const redirectRole = (userRole, ...neededRole) => {
 
  if (neededRole != userRole) {
    return false;
  }

  return true;
};

export const renderWithPermission = (userPermissions, renderEl, ...neededPermission) => {
  if (neededPermission.length > 0) {
    if (!neededPermission.every((val) => userPermissions.includes(val))) {
      // permissions not exist
      return null;
    }
  }
  return renderEl;
};

export const getMonthsDropdownOpt = () => {
  const monthsOpt = [];

  for (let i = 0; i < 12; i++) {
    monthsOpt.push({
      value: i,
      label: moment().month(i).format("MMMM"),
    });
  }

  return monthsOpt;
};

export const getFeeTypeDropdownOpt = () => {
  const feeTypes = ["fixed_amount", "percentage"]; 
  const mapFeeTypes = { fixed_amount: "Amount", percentage: "Percentage" };

  const feeTypeOpt = [];
  for (const feeType of feeTypes) {
    feeTypeOpt.push({
      value: feeType,
      label: mapFeeTypes[feeType] ? mapFeeTypes[feeType] : feeType,
    });
  }

  return feeTypeOpt;
};

export const getDefaultPrices = (opt = { count: 3, decParams: [] }) => {
  if (!opt.count) {
    opt.count = 3;
  }
  let prices = [];

  let monthToAdd = 0;
  if (moment().date() > 15) {
    monthToAdd = 1;
  }

  for (let i = 0; i < opt.count; i++) {
    const price = {
      month_index: moment().add(monthToAdd, "month").month(),
    };
    for (const param of opt.decParams) {
      price[param] = "";
    }
    prices.push(price);
    monthToAdd++;
  }

  return prices;
};

export const sortPriceKeys = (commodityList = []) => {
  return (a, b) => {
    const commodityIdxA = commodityList.findIndex(({ value }) => value === a);
    const commodityIdxB = commodityList.findIndex(({ value }) => value === b);

    if (commodityIdxA < commodityIdxB) {
      return -1;
    }
    if (commodityIdxA > commodityIdxB) {
      return 1;
    }
    return 0;
  };
};

export const fileTypeShow = (fileType = "") => {
  if (fileType === "") return "";

  let out = "";

  switch (fileType) {
    case constant.FILE_TYPE_SPAL:
      out = constant.FILE_TYPE_SPAL;
      out = out.toUpperCase();
      break;
    case constant.FILE_TYPE_SPAD:
      out = constant.FILE_TYPE_SPAD;
      out = out.toUpperCase();
      break;
    case constant.FILE_TYPE_LOGISTIC_INSURANCE:
      out = "INSURANCE";
      break;

    default:
      break;
  }

  return out;
};

export const FORM_DATEPICKER_PROPS = {
  format: constant.FORMAT_DISPLAY_DATE,
};

export const FORM_RANGEPICKER_PROPS = {
  ...FORM_DATEPICKER_PROPS,
  placeholder: ["Start", "End"],
};

export const getPPN = () => {
  return Number(localStorage.getItem("ppn"));
};
