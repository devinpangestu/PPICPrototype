import axios from "lib/axios";

const spk = {
  list: (page_size, page_number, commodity_offer_id, logistic_offer_id, otherParam) => {
    let params = {};
    if (commodity_offer_id) {
      params.commodity_offer_id = commodity_offer_id;
    }
    if (logistic_offer_id) {
      params.logistic_offer_id = logistic_offer_id;
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
      url: `/logistic/spk`,
      params: finalParams,
    });
  },
  get: (id) => {
    return axios({
      method: "get",
      url: `/logistic/spk/${id}`,
    });
  },
  create: (data) => {
    return axios({
      method: "post",
      url: `/logistic/spk`,
      data: data,
    });
  },
  createBongkar: (data) => {
    return axios({
      method: "post",
      url: `/logistic/spk/bongkar`,
      data: data,
    });
  },
  edit: (id, data) => {
    return axios({
      method: "put",
      url: `/logistic/spk/${id}`,
      data: data,
    });
  },
  delete: (id) => {
    return axios({
      method: "delete",
      url: `/logistic/spk/${id}`,
    });
  },
};

export default spk;
