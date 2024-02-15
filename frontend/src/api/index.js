import auth from "./auth";
import roles from "./roles";

import commodity_fee from "./commodity_fee";
import users from "./users";
import offers from "./offers";
import prices from "./prices";
import transactions from "./transactions";
import chats from "./chats";
import dataExport from "./dataExport";
import simulation from "./simulation";
import permissions from "./permissions";

import master from "./master";
import logistic from "./logistic";

import file from "./file";

import ppic from "./ppic";
import ppicSuppliers from "./ppicSuppliers";
import purchasing from "./purchasing";
import suppliers from "./suppliers";

const api = {
  auth: auth,
  roles: roles,

  master: master,
  commodityFee: commodity_fee,
  users: users,
  prices: prices,
  offers: offers,
  transactions: transactions,
  chats: chats,
  dataExport: dataExport,
  simulation: simulation,
  permissions: permissions,
  logistic: logistic,
  file: file,
  ppic: ppic,
  suppliers: suppliers,
  ppicSuppliers: ppicSuppliers,
  purchasing: purchasing,
};

export { api };
