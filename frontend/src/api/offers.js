import axios from "lib/axios";

const offers = {
  summary: (params) => {
    return axios({
      method: "get",
      url: `/offers/summary`,
      params: params,
    });
  },
  list: (status, page_size, page_number, otherParam) => {
    let params = {};
    if (status) {
      params.status = status;
    }
    if (page_number) {
      params.page_number = page_number;
    }
    if (page_size) {
      params.page_size = page_size;
    }

    let finalParams = params;
    if (otherParam) {
      finalParams = { ...params, ...otherParam };
    }

    return axios({
      method: "get",
      url: `/offers`,
      params: finalParams,
    });
  },
  get: (id) => {
    return axios({
      method: "get",
      url: `/offers/${id}`,
    });
  },
  create: (offer) => {
    return axios({
      method: "post",
      url: `/offers`,
      data: offer,
    });
  },
  createContractNumber: (offerId, inputContract) => {
    return axios({
      method: "put",
      url: `/offers/${offerId}/contract-number`,
      data: inputContract,
    });
  },
  createFromDraft: (offerId) => {
    return axios({
      method: "post",
      url: `/offers/from-draft`,
      data: {
        offer_id: offerId,
      },
    });
  },
  edit: (offerId, updatedOffer) => {
    return axios({
      method: "put",
      url: `/offers/${offerId}`,
      data: updatedOffer,
    });
  },
  assess: (offerId, assessData) => {
    return axios({
      method: "put",
      url: `/offers/${offerId}/assess`,
      data: assessData,
    });
  },
  decide: (offerId, decideData) => {
    return axios({
      method: "put",
      url: `/offers/${offerId}/decide`,
      data: decideData,
    });
  },
  acceptBid: (offerId) => {
    return axios({
      method: "put",
      url: `/offers/${offerId}/accept-bid`,
    });
  },
  rejectBid: (offerId, data) => {
    return axios({
      method: "put",
      url: `/offers/${offerId}/reject-bid`,
      data: data,
    });
  },
  delete: (id) => {
    return axios({
      method: "delete",
      url: `/offers/${id}`,
    });
  },
  needActionMinDate: () => {
    return axios({
      method: "get",
      url: `/offers/get-min-date`,
    });
  },
};

export default offers;
