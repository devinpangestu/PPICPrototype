export const FORM_NUMBER_FORMAT = new Intl.NumberFormat("id-ID");

export const FORM_SELECT_SEARCHABLE_PROPS = {
  filterOption: (input, option) => {
    let label = "";
    if (option.children) {
      label = option.children;
    } else if (option.label) {
      label = option.label;
    }
    return label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  },
};

export const FORM_MONEY_VALUE = (value, stateValue) => {
  if (stateValue === undefined) return null;

  return FORM_NUMBER_FORMAT.format(stateValue);
};

export const FORM_MONEY_FORMATTER = (value, info) => {
  if (!value) return "";
  return `${FORM_NUMBER_FORMAT.format(value)}`;
};

export const FORM_MONEY_PARSER = (value) => {
  // for when the input gets cleared
  if (typeof value === "string" && !value.length) {
    return null;
  }

  if (value === "-") {
    return value;
  }

  let isNegative = false;

  let trimmedValue = value;
  if (value.includes(",")) {
    trimmedValue = trimmedValue.replace(/,/g, ".");
  }
  if (Number(trimmedValue) < 0) {
    isNegative = true;
  }

  try {
    // detecting and parsing between comma and dot
    var group = FORM_NUMBER_FORMAT.format(1111).replace(/1/g, "");
    var decimal = FORM_NUMBER_FORMAT.format(1.1).replace(/1/g, "");
    var reversedVal = value.replace(new RegExp("\\" + group, "g"), "");
    reversedVal = reversedVal.replace(new RegExp("\\" + decimal, "g"), ".");
    //  => 1232.21 €

    // removing everything except the digits and dot
    reversedVal = reversedVal.replace(/[^0-9.]/g, "");
    //  => 1232.21

    // appending digits properly
    const digitsAfterDecimalCount = (reversedVal.split(".")[1] || []).length;

    if (digitsAfterDecimalCount > 2) {
      return value.substr(0, value.length - 2);
    }

    const needsDigitsAppended = digitsAfterDecimalCount > 2;

    if (needsDigitsAppended) {
      reversedVal = reversedVal * Math.pow(10, digitsAfterDecimalCount - 2);
    }

    if (isNegative) {
      reversedVal = reversedVal * -1;
    }

    return Number.isNaN(reversedVal) ? null : reversedVal;
  } catch (error) {
    console.error(error);
  }
};

export const FORM_MONEY_DEFAULT_PROPS = {
  formatter: FORM_MONEY_FORMATTER,
  parser: FORM_MONEY_PARSER,
  min: 0,
  controls: false,
};

export const FORM_PROGRESSIVE_DEFAULT_PROPS = {
  formatter: FORM_MONEY_FORMATTER,
  parser: FORM_MONEY_PARSER,
  controls: false,
};

export const FORM_DATEPICKER_DEFAULT = {
  inputReadOnly: true,
};

export const FORM_QUANTITY_FORMATTER = (value, info) => {
  if (!value) return "";
  return `${FORM_NUMBER_FORMAT.format(value)}`;
};

export const FORM_QUANTITY_PARSER = (value) => {
  // for when the input gets cleared
  if (typeof value === "string" && !value.length) {
    return null;
  }

  if (value === "-") {
    return value;
  }

  let isNegative = false;

  let trimmedValue = value;
  if (value.includes(",")) {
    trimmedValue = trimmedValue.replace(/,/g, ".");
  }
  if (Number(trimmedValue) < 0) {
    isNegative = true;
  }

  try {
    // detecting and parsing between comma and dot
    var group = FORM_NUMBER_FORMAT.format(1111).replace(/1/g, "");
    var decimal = FORM_NUMBER_FORMAT.format(1.1).replace(/1/g, "");
    var reversedVal = value.replace(new RegExp("\\" + group, "g"), "");
    reversedVal = reversedVal.replace(new RegExp("\\" + decimal, "g"), ".");
    //  => 1232.21 €

    // removing everything except the digits and dot
    reversedVal = reversedVal.replace(/[^0-9.]/g, "");
    //  => 1232.21

    // appending digits properly
    const digitsAfterDecimalCount = (reversedVal.split(".")[1] || []).length;

    if (digitsAfterDecimalCount > 3) {
      return value.substr(0, value.length - 2);
    }

    const needsDigitsAppended = digitsAfterDecimalCount > 3;

    if (needsDigitsAppended) {
      reversedVal = reversedVal * Math.pow(10, digitsAfterDecimalCount - 2);
    }

    if (isNegative) {
      reversedVal = reversedVal * -1;
    }

    return Number.isNaN(reversedVal) ? null : reversedVal;
  } catch (error) {
    console.error(error);
  }
};

export const FORM_QUANTITY_DEFAULT_PROPS = {
  formatter: FORM_QUANTITY_FORMATTER,
  parser: FORM_QUANTITY_PARSER,
  min: 0,
  controls: false,
};
