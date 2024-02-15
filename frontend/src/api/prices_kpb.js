import axios from "lib/axios";

const kpb = {
  list: (date) => {
    return axios({
      method: "get",
      url: `/prices/kpb/${date}`,
    });
  },
  get: (date, id) => {
    return axios({
      method: "get",
      url: `/prices/kpb/${date}/${id}`,
    });
  },
  input: (data) => {
    return axios({
      method: "post",
      url: `/prices/kpb`,
      data: data,
    });
  },
};

export default kpb;
