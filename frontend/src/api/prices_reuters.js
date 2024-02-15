import axios from "lib/axios";

const reuters = {
  inputInfo: (data) => {
    return axios({
      method: "post",
      url: `/prices/reuters/info`,
      data: data,
    });
  },
  inputCrudeOil: (data) => {
    return axios({
      method: "post",
      url: `/prices/reuters/crude-oil`,
      data: data,
    });
  },

  list: (date) => {
    return axios({
      method: "get",
      url: `/prices/reuters/${date}`,
    });
  },
  get: (date, type, commodity) => {
    return axios({
      method: "get",
      url: `/prices/reuters/${date}/${type}/${commodity}`,
    });
  },
  create: (data) => {
    return axios({
      method: "post",
      url: `/prices/reuters`,
      data: data,
    });
  },
  edit: (date, type, commodity, updatedData) => {
    return axios({
      method: "put",
      url: `/prices/reuters/${date}/${type}/${commodity}`,
      data: updatedData,
    });
  },
};

export default reuters;
