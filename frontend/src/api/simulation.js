import axios from "lib/axios";

const simulation = {
  get: (date) => {
    return axios({
      method: "get",
      url: `/simulations/${date}`,
    });
  },
  create: (data) => {
    return axios({
      method: "post",
      url: `/simulations`,
      data: data,
    });
  },
  edit: (simulation_id, data) => {
    return axios({
      method: "put",
      url: `/simulations/${simulation_id}`,
      data: data,
    });
  },
};

export default simulation;
