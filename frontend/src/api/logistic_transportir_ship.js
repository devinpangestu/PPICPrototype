import axios from "lib/axios";

const ships = {
  list: (transportir_id, search, page_size, page_number) => {
    let params = {};
    if (transportir_id) params.transportir_id = transportir_id;
    if (search) params.search = search;
    if (page_number) params.page_number = page_number;
    if (page_size) params.page_size = page_size;

    return axios({
      method: "get",
      url: `/logistic/transportir/ship`,
      params: params,
    });
  },
  get: (ship_id) => {
    return axios({
      method: "get",
      url: `/logistic/transportir/ship/${ship_id}`,
    });
  },
  create: (data, isMass) => {
    let params = {};

    if (isMass) params.mass = "true";

    return axios({
      method: "post",
      url: `/logistic/transportir/ship`,
      data,
      params,
    });
  },
  edit: (id, data) => {
    return axios({
      method: "put",
      url: `/logistic/transportir/ship/${id}`,
      data: data,
    });
  },
  delete: (id) => {
    return axios({
      method: "delete",
      url: `/logistic/transportir/ship/${id}`,
    });
  },
  histories: (search, page_size, page_number) => {
    let params = {};
    if (search) {
      params.search = search;
    }
    if (page_number) {
      params.page_number = page_number;
    }
    if (page_size) {
      params.page_size = page_size;
    }
    return axios({
      method: "get",
      url: `/logistic/transportir/ship-history`,
      params: params,
    });
  },
  history: (supplierId) => {
    return axios({
      method: "get",
      url: `/logistic/transportir/ship/${supplierId}/history`,
    });
  },
  transactions: (supplierId, page_size, page_number) => {
    let params = {};
    if (page_number) {
      params.page_number = page_number;
    }
    if (page_size) {
      params.page_size = page_size;
    }
    return axios({
      method: "get",
      url: `/logistic/transportir/ship/${supplierId}/transactions`,
      params,
    });
  },
};

export default ships;
