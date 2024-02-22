import axios from "lib/axios";

const ppic = {
  summary: (params) => {
    return axios({
      method: "get",
      url: `/ppic/summary`,
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
      url: `/ppic`,
      params: finalParams,
    });
  },

  create: (data, isMass) => {
    let params = {};

    if (isMass) params.mass = "true";

    return axios({
      method: "post",
      url: `/ppic`,
      data,
      params,
    });
  },
  splitPPIC: (id, data) => {
    return axios({
      method: "put",
      url: `/ppic/split-ppic/${id}`,
      data: { schedules: data },
    });
  },
  get: (id) => {
    return axios({
      method: "get",
      url: `/ppic/${id}`,
    });
  },
  getPODetail: (params) => {
    return axios({
      method: "get",
      url: `/ppic/po-details`,
      params,
    });
  },
  edit: (data) => {
    return axios({
      method: "put",
      url: `/ppic`,
      data: { schedules: data },
    });
  },
  delete: (id, csrfToken) => {
    return axios({
      method: "delete",
      url: `/ppic/${id}`,
      headers: {
        "X-CSRF-Token": csrfToken,
      },
    });
  },
  refreshPOOuts: (params) => {
    return axios({
      method: "put",
      url: `/ppic/refresh-outs`,
      params,
    });
  },
  sendToPurchasing: (data, isMass) => {
    let params = {};

    if (isMass) params.mass = "true";

    return axios({
      method: "put",
      url: `/ppic/sendt-purchasing`,
      data,
      params,
    });
  },
  acceptSplit: (id) => {
    return axios({
      method: "put",
      url: `/ppic/accept-split`,
      data: { id },
    });
  },
  rejectSplit: (id) => {
    return axios({
      method: "put",
      url: `/ppic/reject-split`,
      data: { id },
    });
  },
  acceptEdit: (id) => {
    return axios({
      method: "put",
      url: `/ppic/accept-edit`,
      data: { id },
    });
  },
  rejectEdit: (id) => {
    return axios({
      method: "put",
      url: `/ppic/reject-edit`,
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
      url: `/ppic-history`,
      params: params,
    });
  },
  history: (supplierId) => {
    return axios({
      method: "get",
      url: `/ppic/${supplierId}/history`,
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
      url: `/ppic/${supplierId}/transactions`,
      params,
    });
  },
  needActionMinDate: () => {
    return axios({
      method: "get",
      url: `/ppic/get-min-date`,
    });
  },
};

export default ppic;
