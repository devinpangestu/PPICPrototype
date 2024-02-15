import axios from "lib/axios";

const histories = {
  list: (pageSize, pageNumber, otherParam) => {
    let params = {};
    if (pageNumber) {
      params.page_number = pageNumber;
    }
    if (pageSize) {
      params.page_size = pageSize;
    }

    let finalParams = params;
    if (otherParam) {
      finalParams = { ...params, ...otherParam };
    }

    return axios({
      method: "get",
      url: `/logistic/transactions`,
      params: finalParams,
    });
  },
  get: (id) => {
    return axios({
      method: "get",
      url: `/logistic/transactions/${id}`,
    });
  },
  delivered: (transactionId, deliveredData) => {
    return axios({
      method: "put",
      url: `/logistic/transactions/${transactionId}/delivered`,
      data: deliveredData,
    });
  },
};

export default histories;
