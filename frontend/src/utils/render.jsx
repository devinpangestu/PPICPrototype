import constant from "constant";
import { isNull } from "./validation";

export const renderNullable = (renderEl) => {
  return renderEl ? renderEl : "-";
};

export const thousandSeparator = (x, suffix = null) => {
  if (isNull(x)) {
    return "0";
  }

  const parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  if (suffix) return parts.join(",") + suffix;
  return parts.join(",");

  // return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
};

export const convertSeparateValueToNumericValue = (stringWithSeparator) => {
  return parseFloat(stringWithSeparator.replace(/[,\.]/g, ""));
};

export const getProgressiveColor = (num, form = false) => {
  if (typeof num === Number) {
    num = num.toFixed(2);
  } else if (typeof num === "string") {
    if (num && num !== "-") {
      num = Number(num).toFixed(2);
    } else {
      num = "-";
    }
  } else {
    num = "-";
  }

  let spanClassName = undefined;
  if (form) {
    spanClassName = "form-control border-0 text-center";
  }

  if (num > 0) {
    return (
      <span className={spanClassName} style={{ color: "green" }}>
        {"+" + thousandSeparator(num)}
      </span>
    );
  } else if (num < 0) {
    return (
      <span className={spanClassName} style={{ color: "red" }}>
        {thousandSeparator(num)}
      </span>
    );
  }

  return <span className={spanClassName}>{thousandSeparator(num)}</span>;
};

export const getOfferStatusColor = (offerStatus) => {
  let color = "processing";
  switch (offerStatus) {
    case constant.STATUS_PENDING_ASSESSMENT:
      color = "warning";
      break;
    case constant.STATUS_PENDING_APPROVAL:
      color = "warning";
      break;
    case constant.STATUS_PENDING_BID_RESPONSE:
      color = "warning";
      break;
    case constant.STATUS_REJECTED:
      color = "error";
      break;
    case constant.STATUS_APPROVED:
      color = "success";
      break;

    default:
      color = "success";
      break;
  }
  return color;
};

export const getLogOfferStatusColor = (logOfferStatus) => {
  let color = "processing";
  switch (logOfferStatus) {
    case constant.STATUS_PENDING_APPROVAL:
      color = "warning";
      break;
    case constant.STATUS_ADJUST:
      color = "warning";
      break;
    case constant.STATUS_REJECTED:
      color = "error";
      break;
    case constant.STATUS_APPROVED:
      color = "success";
      break;

    default:
      color = "success";
      break;
  }
  return color;
};
