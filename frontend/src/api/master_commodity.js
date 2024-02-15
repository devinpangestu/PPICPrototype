import axios from "lib/axios";

const commodity = {
  create: (data) => {
    return axios({
      method: "post",
      url: `/master/commodity`,
      data: data,
    });
  },
  edit: (id, data) => {
    return axios({
      method: "put",
      url: `/master/commodity/${id}`,
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
      url: `/master/commodity`,
      params: params,
    });
  },
  get: (id) => {
    return axios({
      method: "get",
      url: `/master/commodity/${id}`,
    });
  },
  delete: (id) => {
    return axios({
      method: "delete",
      url: `/master/commodity/${id}`,
    });
  },
};

export default commodity;
