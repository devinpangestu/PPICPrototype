import { api } from "api";
import utils from "utils";

export const getTransportirs = (setPageLoading, setTransportirs) => {
  setPageLoading(true);
  api.logistic.transportirs
    .list("", 1000, 1)
    .then(function (response) {
      const rsBody = response.data.rs_body;
      let transportirs = [];
      rsBody.transportirs.forEach((el) => {
        transportirs.push({ value: el.id, label: el.name, types: el.types });
      });
      setTransportirs(transportirs);
    })
    .catch(function (error) {
      utils.swal.Error({ msg: utils.getErrMsg(error) });
    })
    .finally(function () {
      setPageLoading(false);
    });
};

export const getShips = (setPageLoading, setShips, transportirId) => {
  console.log(transportirId);
  api.logistic.ships
    .list(transportirId, "", 1000, 1)
    .then(function (response) {
      const rsBody = response.data.rs_body;

      let ships = [];
      rsBody.ships.forEach((el) => {
        ships.push({ value: el.id, label: el.name, capacity: el.capacity });
      });
      setShips(ships);
    })
    .catch(function (error) {
      utils.swal.Error({ msg: utils.getErrMsg(error) });
    })
    .finally(function () {
      setPageLoading(false);
    });
};

export const getAllRoutes = (setPageLoading, setAllRoutes) => {
  setPageLoading(true);
  api.master.shipmentBudgets
    .list(1000, 1)
    .then(function (response) {
      const rsBody = response.data.rs_body;

      let transportirs = [];
      rsBody.budget_transportirs.forEach((el) => {
        transportirs.push({
          value: el.id,
          label: `${el.hOver_loc.name} - ${el.dstn_loc.name}`,
          types: el.types,
          handover: el.hOver_loc,
          destination: el.dstn_loc,
          budget: el.budget,
        });
      });
      setAllRoutes(transportirs);
    })
    .catch(function (error) {
      utils.swal.Error({ msg: utils.getErrMsg(error) });
    })
    .finally(function () {
      setPageLoading(false);
    });
};

export const getShipRoutes = (setPageLoading, setShipRoutes) => {
  setPageLoading(true);
  api.master.shipmentBudgets
    .list(1000, 1, "ship")
    .then(function (response) {
      const rsBody = response.data.rs_body;

      let transportirs = [];
      rsBody.budget_transportirs.forEach((el) => {
        transportirs.push({
          value: el.id,
          label: `${el.hOver_loc.name} - ${el.dstn_loc.name}`,
          types: "ship",
          handover: el.hOver_loc,
          destination: el.dstn_loc,
          budget: el.budget,
        });
      });
      setShipRoutes(transportirs);
    })
    .catch(function (error) {
      utils.swal.Error({ msg: utils.getErrMsg(error) });
    })
    .finally(function () {
      setPageLoading(false);
    });
};

export const getDischargeRoutes = (setPageLoading, setDischargeRoutes) => {
  setPageLoading(true);
  api.master.shipmentBudgets
    .list(1000, 1, "discharged_truck")
    .then(function (response) {
      const rsBody = response.data.rs_body;

      let transportirs = [];
      rsBody.budget_transportirs.forEach((el) => {
        transportirs.push({
          value: el.id,
          label: `${el.hOver_loc.name} - ${el.dstn_loc.name}`,
          types: "discharged_truck",
          handover: el.hOver_loc,
          destination: el.dstn_loc,
          budget: el.budget,
        });
      });
      setDischargeRoutes(transportirs);
    })
    .catch(function (error) {
      utils.swal.Error({ msg: utils.getErrMsg(error) });
    })
    .finally(function () {
      setPageLoading(false);
    });
};
