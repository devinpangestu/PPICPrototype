import moment from "moment";
import { getProgressiveColor, thousandSeparator } from "./render";

export const getNumericCol = (title, field, obj = {}) => {
  const { suffix, dashIfZero, ...others } = obj;
  return {
    title: title,
    dataIndex: field,
    key: field,
    align: "center",
    ...others,
    render: (val) => {
      if (!Number(val)) {
        return "-";
      }
      if (dashIfZero === true && Number(val) === 0) {
        return "-";
      }
      return thousandSeparator(Number(val).toFixed(2), suffix);
    },
  };
};
export const getPriceCol = (title, field) => {
  return {
    ...getNumericCol(title, field),
    colSpan: 2,
  };
};
export const getProgressiveCol = (title, field) => {
  return {
    title: title,
    colSpan: 0,
    dataIndex: field,
    key: field,
    align: "center",
    render: (val) => getProgressiveColor(val),
  };
};
export const getMonthCol = (title) => {
  return {
    title: title,
    dataIndex: "month_index",
    key: "month_index",
    align: "center",
    render: (val) => moment().month(val).format("MMMM"),
  };
};
export const getPlainCol = (title, field, otherProps) => {
  return {
    title: title,
    dataIndex: field,
    key: field,
    align: "center",
    ...otherProps,
  };
};
