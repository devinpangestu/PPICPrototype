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

export const parsingDateToString = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;

  return formattedDate;
};

export const parsingStringToDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

  return formattedDate;
};

export const parsingStringToDateEarly = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String("00");
  const minute = String("00");
  const second = String("00");

  const formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

  return formattedDate;
};

export const parsingStringToDateLate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String("23");
  const minute = String("59");
  const second = String("59");

  const formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

  return formattedDate;
};

export const parsingStringToLocalDateEarly = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String("07");
  const minute = String("00");
  const second = String("00");

  const formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

  return formattedDate;
};

export const parsingStringToLocalDateLate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String("06");
  const minute = String("59");
  const second = String("59");

  const formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

  return formattedDate;
};

export const parseID = (idStr) => {
  const numID = parseInt(idStr, 10);

  return [numID, null];
};

export const parsingDateToIndoFormat = (dateString) => {
  return (
    parsingDateToString(dateString).split("-")[2] +
    " " +
    monthMapping[parsingDateToString(dateString).split("-")[1]] +
    " " +
    parsingDateToString(dateString).split("-")[0]
  );
};

export const formattedMSSQLDate = (dateToConvert) =>
  dateToConvert.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC", // Set your desired time zone
  });
