import { api } from "api";
import * as transportir from "./transportir";
import * as price from "./price";
import * as common from "./common";
import * as authorizationCheck from "./authorizationCheck";

const handleLogout = () => {
  api.auth.logout().finally(function () {
    localStorage.clear();
    window.location.replace("/login");
  });
};

const handler = {
  handleLogout,
  ...transportir,
  ...price,
  ...common,
  ...authorizationCheck,
};

export default handler;
