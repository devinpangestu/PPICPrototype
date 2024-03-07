import { api } from "api";
import * as transportir from "./transportir";
import * as price from "./price";
import * as common from "./common";
import * as authorizationCheck from "./authorizationCheck";
import constant from "constant";

const handleLogout = () => {
  api.auth.logout(localStorage.getItem(constant.ACCESS_TOKEN), false).finally(function () {
    localStorage.clear();
    window.location.replace("/login");
  });
};
const handleLogoutClick = () => {
  api.auth.logout(localStorage.getItem(constant.ACCESS_TOKEN), true).finally(function () {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("/login");
  });
};

const handler = {
  handleLogout,
  handleLogoutClick,
  ...transportir,
  ...price,
  ...common,
  ...authorizationCheck,
};

export default handler;
