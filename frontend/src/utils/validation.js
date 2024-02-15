import constant from "constant";
import swalCommon from "./swal";
import moment from "moment";

export const isPriceMonthsValid = (prices = []) => {
  let lastMonthIdx = -1;
  for (const p of prices) {
    if (p.month_index <= lastMonthIdx) {
      swalCommon.Error({ msg: "Please re-check the months order" });
      return false;
    }
    lastMonthIdx = p.month_index;
  }
  return true;
};

export const isEmptyObj = (obj) => {
  return (
    obj && // 👈 null and undefined check
    Object.keys(obj).length === 0 &&
    obj.constructor === Object
  );
};

export const isNull = (x) => {
  if (!x && x !== 0 && x !== "0" && x !== false && x !== "") {
    return true;
  }
  return false;
};

// list is react select obj list
export const isInTheList = (list, value) => {
  for (const el of list) {
    if (el.value === value) {
      return true;
    }
  }

  return false;
};

export const isToday = (date) => {
  if (moment().isSame(moment(date), "day")) {
    return true;
  }
  return false;
};

export const standardizeDate = (inputDate) => {
  const parsedDate = moment(
    inputDate,
    [
      "YYYY-MMM-DD",
      "YYYY-MM-DD",
      "YYYY-DD-MMM",
      "YYYY-DD-MM",
      "MMM-DD-YYYY",
      "MMM-DD-YY",
      "MM-DD-YYYY",
      "MM-DD-YY",
      "DD-MMM-YYYY",
      "DD-MMM-YY",
      "DD-MM-YYYY",
      "DD-MM-YY",
      "YYYY/MMM/DD",
      "YYYY/MM/DD",
      "YYYY/DD/MMM",
      "YYYY/DD/MM",
      "MMM/DD/YYYY",
      "MMM/DD/YY",
      "MM/DD/YYYY",
      "MM/DD/YY",
      "DD/MMM/YYYY",
      "DD/MMM/YY",
      "DD/MM/YYYY",
      "DD/MM/YY",
    ],
    true,
  );

  if (parsedDate.isValid()) {
    return parsedDate.format("DD-MM-YYYY");
  } else {
    console.error(`Invalid date: ${inputDate}`);
    // Handle invalid dates as needed
    return null;
  }
};

export const sendToApiFormat = (inputDate) => {
  const parsedDate = moment(
    inputDate,
    [
      "YYYY-MMM-DD",
      "YYYY-MM-DD",
      "YYYY-DD-MMM",
      "YYYY-DD-MM",
      "MMM-DD-YYYY",
      "MMM-DD-YY",
      "MM-DD-YYYY",
      "MM-DD-YY",
      "DD-MMM-YYYY",
      "DD-MMM-YY",
      "DD-MM-YYYY",
      "DD-MM-YY",
      "YYYY/MMM/DD",
      "YYYY/MM/DD",
      "YYYY/DD/MMM",
      "YYYY/DD/MM",
      "MMM/DD/YYYY",
      "MMM/DD/YY",
      "MM/DD/YYYY",
      "MM/DD/YY",
      "DD/MMM/YYYY",
      "DD/MMM/YY",
      "DD/MM/YYYY",
      "DD/MM/YY",
    ],
    true,
  );

  if (parsedDate.isValid()) {
    return parsedDate.format(constant.FORMAT_API_DATE);
  } else {
    console.error(`Invalid date: ${inputDate}`);
    // Handle invalid dates as needed
    return null;
  }
};
