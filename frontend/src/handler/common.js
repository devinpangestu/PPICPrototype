import { api } from "api";
import utils from "utils";
import constant from "constant";
import moment from "moment";

export const getRoles = (setPageLoading, setRoles) => {
  setPageLoading(true);
  api.roles
    .list()
    .then(function (response) {
      const rsBody = response.data.rs_body;
      let roles = [];

      rsBody.roles.forEach((el) => {
        roles.push({ value: el.id, label: el.desc_ });
      });
      setRoles(roles);
    })
    .catch(function (error) {
      utils.swal.Error({ msg: utils.getErrMsg(error) });
    })
    .finally(function () {
      setPageLoading(false);
    });
};

export const getSuppliers = (setPageLoading, setSuppliers, commodityId) => {
  setPageLoading(true);
  api.ppicSuppliers
    .list("", 1000, 1, commodityId)
    .then(function (response) {
      const rsBody = response.data.rs_body;
      let suppliers = [];
      if (rsBody.suppliers) {
        rsBody.suppliers.forEach((el) => {
          suppliers.push({ value: el.id, label: el.name });
        });
      }
      setSuppliers(suppliers);
    })
    .catch(function (error) {
      utils.swal.Error({ msg: utils.getErrMsg(error) });
    })
    .finally(function () {
      setPageLoading(false);
    });
};

export const getWarehouses = (setPageLoading, setWarehouses, commodityId) => {
  setPageLoading(true);
  api.master.warehouse
    .list("", 1000, 1, commodityId)
    .then(function (response) {
      const rsBody = response.data.rs_body;
      let warehouses = [];
      if (rsBody.warehouses) {
        rsBody.warehouses.forEach((el) => {
          warehouses.push({ value: el.id, label: `${el.warehouse_id} - ${el.name}` });
        });
      }
      setWarehouses(warehouses);
    })
    .catch(function (error) {
      utils.swal.Error({ msg: utils.getErrMsg(error) });
    })
    .finally(function () {
      setPageLoading(false);
    });
};

export const getCommodities = (setPageLoading, setState) => {
  setPageLoading(true);
  api.master.commodity
    .list("", 1000, 1)
    .then(function (response) {
      const rsBody = response.data.rs_body;
      let commodities = [];
      rsBody.commodities.forEach((el) => {
        commodities.push({ value: el.id, label: el.name });
      });
      setState(commodities);
    })
    .catch(function (error) {
      utils.swal.Error({ msg: utils.getErrMsg(error) });
    })
    .finally(function () {
      setPageLoading(false);
    });
};

export const getHandoverLocations = (setPageLoading, setHandoverLocation) => {
  setPageLoading(true);
  api.master.handover_location
    .list("", 1000, 1)
    .then(function (response) {
      const rsBody = response.data.rs_body;
      let handover_locations = [];
      rsBody.handover_locations.forEach((el) => {
        handover_locations.push({ value: el.id, label: el.name });
      });
      setHandoverLocation(handover_locations);
    })
    .catch(function (error) {
      utils.swal.Error({ msg: utils.getErrMsg(error) });
    })
    .finally(function () {
      setPageLoading(false);
    });
};
export const getDestinationLocations = (setPageLoading, setDestinationLocation) => {
  setPageLoading(true);
  api.master.handover_location
    .list("", 1000, 1)
    .then(function (response) {
      const rsBody = response.data.rs_body;
      let handover_locations = [];

      rsBody.handover_locations.forEach((el) => {
        handover_locations.push({ value: el.id, label: el.name });
      });
      setDestinationLocation(handover_locations);
    })
    .catch(function (error) {
      utils.swal.Error({ msg: utils.getErrMsg(error) });
    })
    .finally(function () {
      setPageLoading(false);
    });
};

export const getBudgetTransportir = (setPageLoading, setBudgetTransportirs) => {
  setPageLoading(true);
  api.master.budget_transportir
    .list("", 1000, 1)
    .then(function (response) {
      const rsBody = response.data.rs_body;
      let budget_transportirs = [];
      rsBody.budget_transportirs.forEach((el) => {
        budget_transportirs.push({ value: el.id, label: el.name });
      });
      setBudgetTransportirs(budget_transportirs);
    })
    .catch(function (error) {
      utils.swal.Error({ msg: utils.getErrMsg(error) });
    })
    .finally(function () {
      setPageLoading(false);
    });
};

export const getShipmentBudget = (setPageLoading, setShipmentBudgets) => {
  setPageLoading(true);
  api.master.shipmentBudgets
    .list("", 1000, 1)
    .then(function (response) {
      const rsBody = response.data.rs_body;
      let shipmentBudgets = [];
      rsBody.shipmentBudgets.forEach((el) => {
        shipmentBudgets.push({ value: el.id, label: el.name });
      });
      setShipmentBudgets(shipmentBudgets);
    })
    .catch(function (error) {
      utils.swal.Error({ msg: utils.getErrMsg(error) });
    })
    .finally(function () {
      setPageLoading(false);
    });
};

export const getSimulation = (setPageLoading, setSimulation, date) => {
  setPageLoading(true);
  const momentDate = date ? moment(date) : moment();
  api.simulation
    .get(momentDate.format(constant.FORMAT_API_DATE))
    .then(function (response) {
      const rsBody = response.data.rs_body;
      let simulations = [];
      // rsBody.forEach((el) => {
      //   simulations.push({ value: el.id, label: el.name });
      // });
      if (rsBody.length > 0) {
        setSimulation(rsBody[0]);
      }
      console.log(simulations);
    })
    .catch(function (error) {
      utils.swal.Error({ msg: utils.getErrMsg(error) });
    })
    .finally(function () {
      setPageLoading(false);
    });
};

export const getDealers = (setPageLoading, setDealers) => {
  setPageLoading(true);
  const dealer_id = constant.ROLE_DEALER;
  const dealer_log_spv_id = constant.ROLE_DEALER_LOG_TRANSPORTIR_SPV;
  const dealer_ids = [dealer_id, dealer_log_spv_id];
  api.users
    .list("", 1000, 1, dealer_ids)
    .then(function (response) {
      const rsBody = response.data.rs_body;
      let users = [];
      rsBody.users.forEach((el) => {
        users.push({ value: el.id, label: el.name });
      });
      setDealers(users);
    })
    .catch(function (error) {
      utils.swal.Error({ msg: utils.getErrMsg(error) });
    })
    .finally(function () {
      setPageLoading(false);
    });
};

export const getCommodityFee = (setPageLoading, setCommodityFeeMap) => {
  api.commodityFee
    .list()
    .then(function (response) {
      setCommodityFeeMap(response.data.rs_body);
    })
    .catch(function (error) {
      utils.swal.Error({ msg: utils.getErrMsg(error) });
    })
    .finally(function () {
      setPageLoading(false);
    });
};

export const getSuppliersOptionList = (setPageLoading, setSuppliers) => {
  setPageLoading(true);
  api.ppicSuppliers
    .list("", 1000, 1, true)
    .then(function (response) {
      const rsBody = response.data.rs_body;
      let suppliers = [{ value: null, label: "All" }];
      if (rsBody.suppliers) {
        rsBody.suppliers.forEach((el) => {
          suppliers.push({ value: el.ref_id, label: el.name });
        });
      }
      setSuppliers(suppliers);
    })
    .catch(function (error) {
      utils.swal.Error({ msg: utils.getErrMsg(error) });
    })
    .finally(function () {
      setPageLoading(false);
    });
};

export const getPPICUserOptionList = (setPageLoading, setUsers) => {
  setPageLoading(true);
  api.users
    .list("", 1000, 1, true)
    .then(function (response) {
      const rsBody = response.data.rs_body;
      let users = [{ value: null, label: "All" }];
      if (rsBody.users) {
        rsBody.users.forEach((el) => {
          users.push({ value: el.id, label: el.name });
        });
      }
      console.log(rsBody);
      setUsers(users);
    })
    .catch(function (error) {
      utils.swal.Error({ msg: utils.getErrMsg(error) });
    })
    .finally(function () {
      setPageLoading(false);
    });
};

export const getPurchasingOptionList = (setPageLoading, setUsers) => {
  setPageLoading(true);
  api.users
    .list("", 1000, 1, true)
    .then(function (response) {
      const rsBody = response.data.rs_body;
      let users = [{ value: null, label: "All" }];
      if (rsBody.users) {
        rsBody.users.forEach((el) => {
          console.log(el);
          users.push({ value: el.id, label: el.name });
        });
      }

      setUsers(users);
    })
    .catch(function (error) {
      utils.swal.Error({ msg: utils.getErrMsg(error) });
    })
    .finally(function () {
      setPageLoading(false);
    });
};

export const getPPICs = (setPageLoading, setPPICs) => {
  setPageLoading(true);
  const ppic_super_user = constant.ROLE_SUPER_ADMIN;
  const ppic_main = constant.ROLE_PPIC;
  const ppic_ids = [ppic_super_user, ppic_main];
  api.users
    .list("", 1000, 1, ppic_ids)
    .then(function (response) {
      const rsBody = response.data.rs_body;
      let users = [{ value: null, label: "All" }];
      rsBody.users.forEach((el) => {
        users.push({ value: el.id, label: el.name });
      });
      setPPICs(users);
    })
    .catch(function (error) {
      utils.swal.Error({ msg: utils.getErrMsg(error) });
    })
    .finally(function () {
      setPageLoading(false);
    });
};
export const getPurchasing = (setPageLoading, setPurchasing) => {
  setPageLoading(true);
  const purchasing_super_user = constant.ROLE_SUPER_ADMIN;
  const purchasing_main = constant.ROLE_PURCHASING;
  const purchasing_admin_main = constant.ROLE_PURCHASING_ADMIN;
  const purchasing_ids = [purchasing_super_user, purchasing_main, purchasing_admin_main];
  api.users
    .list("", 1000, 1, purchasing_ids)
    .then(function (response) {
      const rsBody = response.data.rs_body;
      let users = [{ value: null, label: "All" }];
      rsBody.users.forEach((el) => {
        users.push({ value: el.id, label: el.name + " - " + el.oracle_username });
      });

      setPurchasing(users);
    })
    .catch(function (error) {
      utils.swal.Error({ msg: utils.getErrMsg(error) });
    })
    .finally(function () {
      setPageLoading(false);
    });
};
