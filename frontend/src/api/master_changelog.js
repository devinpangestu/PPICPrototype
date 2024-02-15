import axios from "lib/axios";

const changelog = {
  list: () => {
    return axios({
      method: "get",
      url: `/master/changelog`,
    });
  },
  get: (type) => {
    return axios({
      method: "get",
      url: `/master/changelog/${type}`,
    });
  },
};

export default changelog;
