import axios from "lib/axios";

const dalian = {
  list: (date) => {
    return axios({
      method: "get",
      url: `/prices/dalian/${date}`,
    });
  },
  get: (date, commodity) => {
    return axios({
      method: "get",
      url: `/prices/dalian/${date}/${commodity}`,
    });
  },
  input: (data) => {
    return axios({
      method: "post",
      url: `/prices/dalian`,
      data: data,
    });
  },
};

export default dalian;
