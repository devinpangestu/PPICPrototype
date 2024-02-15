import constant from "constant";

export const getToken = () => {
  if (localStorage.getItem(constant.ACCESS_TOKEN)) {
    return `bearer ${localStorage.getItem(constant.ACCESS_TOKEN)}`;
  }
  return null;
};
