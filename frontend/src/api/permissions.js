import axios from "lib/axios";

const simulation = {
  list: () => {
    return axios({
      method: "get",
      url: `/permissions`,
    });
  },
};

export default simulation;
