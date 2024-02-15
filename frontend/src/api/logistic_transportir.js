import axios from "lib/axios";

const transportir = {
  list: (search, page_size, page_number) => {
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
      url: `/logistic/transportir`,
      params: params,
    });
  },
  get: (supplier_id) => {
    return axios({
      method: "get",
      url: `/logistic/transportir/${supplier_id}`,
    });
  },
  create: (data, isMass) => {
    let params = {};

    if (isMass) params.mass = "true";

    return axios({
      method: "post",
      url: `/logistic/transportir`,
      data,
      params,
    });
  },
  edit: (supplier_id, data) => {
    return axios({
      method: "put",
      url: `/logistic/transportir/${supplier_id}`,
      data: data,
    });
  },
  delete: (id) => {
    return axios({
      method: "delete",
      url: `/logistic/transportir/${id}`,
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
      url: `/logistic/transportir-history`,
      params: params,
    });
  },
  history: (supplierId) => {
    return axios({
      method: "get",
      url: `/logistic/transportir/${supplierId}/history`,
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
      url: `/logistic/transportir/${supplierId}/transactions`,
      params,
    });
  },
};


export default transportir;
