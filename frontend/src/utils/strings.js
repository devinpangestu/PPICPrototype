export const upperCaseFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const snakeToTitleCase = (str) => {
  return str
    .replace(/[_\s]+/g, "-")
    .split("-")
    .map((word) => {
      return word.slice(0, 1).toUpperCase() + word.slice(1);
    })
    .join(" ");
};
export const capitalizeCase = (str) => {
  return str.toUpperCase();
};
