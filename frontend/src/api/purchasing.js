import axios from "lib/axios";

const purchasing = {
  summary: (params) => {
    return axios({
      method: "get",
      url: `/purchasing/summary`,
      params: params,
    });
  },
  list: (status, page_size, page_number, otherParam) => {
    let params = {};
    if (status) {
      params.status = status;
    }
    if (page_number) {
      params.page_number = page_number;
    }
    if (page_size) {
      params.page_size = page_size;
    }

    let finalParams = params;
    if (otherParam) {
      finalParams = { ...params, ...otherParam };
    }

    return axios({
      method: "get",
      url: `/purchasing`,
      params: finalParams,
    });
  },

  create: (data, isMass) => {
    let params = {};

    if (isMass) params.mass = "true";

    return axios({
      method: "post",
      url: `/purchasing`,
      data,
      params,
    });
  },
  splitPurchasing: (id, data) => {
    return axios({
      method: "put",
      url: `/purchasing/split-purchasing/${id}`,
      data: { schedules: data },
    });
  },
  get: (id) => {
    return axios({
      method: "get",
      url: `/purchasing/${id}`,
    });
  },
  edit: (data) => {
    return axios({
      method: "put",
      url: `/purchasing`,
      data: { schedules: data },
    });
  },
  retur: (id, data) => {
    return axios({
      method: "put",
      url: `/purchasing/retur/${id}`,
      data,
    });
  },
  sendToSupplier: (data, isMass) => {
    let params = {};
    if (isMass) params.mass = "true";
    return axios({
      method: "put",
      url: `/purchasing/sendt-supplier`,
      data,
      params,
    });
  },
  acceptSplit: (id) => {
    return axios({
      method: "put",
      url: `/purchasing/accept-split`,
      data: { id },
    });
  },
  rejectSplit: (id) => {
    return axios({
      method: "put",
      url: `/purchasing/reject-split`,
      data: { id },
    });
  },
  acceptEdit: (id) => {
    return axios({
      method: "put",
      url: `/purchasing/accept-edit`,
      data: { id },
    });
  },
  rejectEdit: (id) => {
    return axios({
      method: "put",
      url: `/purchasing/reject-edit`,
      data: { id },
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
      url: `/purchasing-history`,
      params: params,
    });
  },
  history: (supplierId) => {
    return axios({
      method: "get",
      url: `/purchasing/${supplierId}/history`,
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
      url: `/purchasing/${supplierId}/transactions`,
      params,
    });
  },
  needActionMinDate: () => {
    return axios({
      method: "get",
      url: `/purchasing/get-min-date`,
    });
  },
};

export default purchasing;
