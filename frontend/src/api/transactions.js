import axios from "lib/axios";

const histories = {
  getPOList: (pageSize, pageNumber, otherParam) => {
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
      url: `/transactions/po-number`,
      params: finalParams,
    });
  },
  getPODetail: (poNumber) => {
    return axios({
      method: "get",
      url: `/transactions/po-number/${poNumber}`,
    });
  },
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
      url: `/transactions`,
      params: finalParams,
    });
  },
  get: (id) => {
    return axios({
      method: "get",
      url: `/transactions/${id}`,
    });
  },
  delivered: (transactionId, deliveredData) => {
    return axios({
      method: "put",
      url: `/transactions/${transactionId}/delivered`,
      data: deliveredData,
    });
  },
};

export default histories;
