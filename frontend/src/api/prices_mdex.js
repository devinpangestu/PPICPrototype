import axios from "lib/axios";

const mdex = {
  inputInfo: (data) => {
    return axios({
      method: "post",
      url: `/prices/mdex/info`,
      data: data,
    });
  },
  inputCBT: (data) => {
    return axios({
      method: "post",
      url: `/prices/mdex/cbt-progressive`,
      data: data,
    });
  },

  list: (date) => {
    return axios({
      method: "get",
      url: `/prices/mdex/${date}`,
    });
  },
  get: (date, commodity) => {
    return axios({
      method: "get",
      url: `/prices/mdex/${date}/${commodity}`,
    });
  },
  create: (data) => {
    return axios({
      method: "post",
      url: `/prices/mdex`,
      data: data,
    });
  },
};

export default mdex;
