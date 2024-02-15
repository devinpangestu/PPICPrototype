import axios from "lib/axios";

const handoverLocations = {
  create: (data) => {
    return axios({
      method: "post",
      url: `/master/handover-location`,
      data: data,
    });
  },
  edit: (id, data) => {
    return axios({
      method: "put",
      url: `/master/handover-location/${id}`,
      data: data,
    });
  },
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
      url: `/master/handover-location`,
      params: params,
    });
  },
  get: (id) => {
    return axios({
      method: "get",
      url: `/master/handover-location/${id}`,
    });
  },
  delete: (id) => {
    return axios({
      method: "delete",
      url: `/master/handover-location/${id}`,
    });
  },
};

export default handoverLocations;
