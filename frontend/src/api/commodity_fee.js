import axios from "lib/axios";

const commodityFee = {
  edit: (commodity, id, data) => {
    return axios({
      method: "put",
      url: `/commodity-fee/${commodity}/${id}`,
      data: data,
    });
  },
  list: () => {
    return axios({
      method: "get",
      url: `/commodity-fee`,
    });
  },
  get: (commodity, id) => {
    return axios({
      method: "get",
      url: `/commodity-fee/${commodity}/${id}`,
    });
  },
};

export default commodityFee;
