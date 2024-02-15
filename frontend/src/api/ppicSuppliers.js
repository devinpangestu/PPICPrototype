import axios from "lib/axios";

const ppicSuppliers = {
  list: (page_size, page_number, forOptions, otherParam) => {
    let params = {};

    if (page_number) {
      params.page_number = page_number;
    }
    if (page_size) {
      params.page_size = page_size;
    }
    if (forOptions) {
      params.for_options = forOptions;
    }
    let finalParams = params;
    if (otherParam) {
      finalParams = { ...params, ...otherParam };
    }

    return axios({
      method: "get",
      url: `/ppic/suppliers`,
      params: finalParams,
    });
  },
  get: (supplier_id) => {
    return axios({
      method: "get",
      url: `/ppic/suppliers/${supplier_id}`,
    });
  },
  create: (data) => {
    return axios({
      method: "post",
      url: `/ppic/suppliers`,
      data: data,
    });
  },
  refresh_suppliers: () => {
    return axios({
      method: "put",
      url: `/ppic/suppliers/refresh-suppliers`,
    });
  },
  createUserAndSendEmail: (id) => {
    return axios({
      method: "post",
      url: `/ppic/suppliers/${id}/create-request`,
    });
  },
  edit: (supplier_id, data) => {
    return axios({
      method: "put",
      url: `/ppic/suppliers/${supplier_id}`,
      data: data,
    });
  },
  delete: (id) => {
    return axios({
      method: "delete",
      url: `/ppic/suppliers/${id}`,
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
      url: `/ppic/suppliers-history`,
      params: params,
    });
  },
  history: (supplierId) => {
    return axios({
      method: "get",
      url: `/ppic/suppliers/${supplierId}/history`,
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
      url: `/ppic/suppliers/${supplierId}/transactions`,
      params,
    });
  },
};

export default ppicSuppliers;
