import axios from "lib/axios";

const config = {
  get: () => {
    return axios({
      method: "get",
      url: `/config`,
    });
  },
};

export default config;
