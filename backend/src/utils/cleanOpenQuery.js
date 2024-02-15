export const cleanOpenQuery = (query) => {
  return query.replace(/\[|\]/g, '"').replace(/;$/, "");
};
