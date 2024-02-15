// ? currently using encoding only, do we need to change ?
export const Encrypt = (str) => {
  return btoa(str);
};

export const Decrypt = (str) => {
  return atob(str);
};
