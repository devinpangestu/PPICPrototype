import axios from "lib/axios";

const config = {
  list: () => {
    return axios({
      method: "get",
      url: `/master/config`,
    });
  },
  get: (name) => {
    return axios({
      method: "get",
      url: `/master/config/${name}`,
    });
  },
  edit: (data) => {
    return axios({
      method: "put",
      url: `/master/config`,
      data: data,
    });
  },
};

export default config;
