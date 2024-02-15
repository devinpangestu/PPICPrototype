import axios from "lib/axios";

const warehouse = {
  create: (data) => {
    return axios({
      method: "post",
      url: `/master/warehouse`,
      data: data,
    });
  },
  edit: (id, data) => {
    return axios({
      method: "put",
      url: `/master/warehouse/${id}`,
      data: data,
    });
  },
  list: (search, page_size, page_number, commodity_id) => {
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
    if (commodity_id) {
      params.commodity_id = commodity_id;
    }

    return axios({
      method: "get",
      url: `/master/warehouse`,
      params: params,
    });
  },
  get: (id) => {
    return axios({
      method: "get",
      url: `/master/warehouse/${id}`,
    });
  },
  delete: (id) => {
    return axios({
      method: "delete",
      url: `/master/warehouse/${id}`,
    });
  },
};

export default warehouse;
