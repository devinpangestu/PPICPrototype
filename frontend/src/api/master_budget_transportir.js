import axios from "lib/axios";

const budgetTransportirs = {
  create: (data) => {
    return axios({
      method: "post",
      url: `/master/budget-transportir`,
      data: data,
    });
  },
  edit: (id, data) => {
    return axios({
      method: "put",
      url: `/master/budget-transportir/${id}`,
      data: data,
    });
  },
  list: (page_size, page_number) => {
    let params = {};

    if (page_number) {
      params.page_number = page_number;
    }
    if (page_size) {
      params.page_size = page_size;
    }
    return axios({
      method: "get",
      url: `/master/budget-transportir`,
      params: params,
    });
  },
  get: (id) => {
    return axios({
      method: "get",
      url: `/master/budget-transportir/${id}`,
    });
  },
  getByParams: (handover_location_id, warehouse_id, terms_of_handover) => {
    let params = {};
    if (handover_location_id) {
      params.handover_location_id = handover_location_id;
    }
    if (warehouse_id) {
      params.warehouse_id = warehouse_id;
    }
    if (terms_of_handover) {
      params.terms_of_handover = terms_of_handover;
    }

    return axios({
      method: "get",
      url: `/master/budget-transportir/get`,
      params: params,
    });
  },
  delete: (id) => {
    return axios({
      method: "delete",
      url: `/master/budget-transportir/${id}`,
    });
  },
};

export default budgetTransportirs;
