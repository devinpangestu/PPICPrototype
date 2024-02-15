import axios from "lib/axios";

const offers = {
  summary: () => {
    return axios({
      method: "get",
      url: `/logistic/offers/summary`,
    });
  },
  list: (status, page_size, page_number, commodity_offer_id, otherParam) => {
    let params = {};
    if (commodity_offer_id) {
      params.commodity_offer_id = commodity_offer_id;
    }
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
      url: `/logistic/offers`,
      params: finalParams,
    });
  },
  get: (id) => {
    return axios({
      method: "get",
      url: `/logistic/offers/${id}`,
    });
  },
  create: (offer) => {
    return axios({
      method: "post",
      url: `/logistic/offers`,
      data: offer,
    });
  },
  createFromDraft: (offerId, data) => {
    return axios({
      method: "post",
      url: `/logistic/offers/${offerId}/from-draft`,
      data,
    });
  },
  createFromExisting: (offerId, id, terms_of_handover, quantity) => {
    return axios({
      method: "post",
      url: `/logistic/offers/${offerId}/create-existing`,
      data: { logistic_offer_id: offerId, id, terms_of_handover, quantity },
    });
  },
  edit: (offerId, updatedOffer) => {
    return axios({
      method: "put",
      url: `/logistic/offers/${offerId}`,
      data: updatedOffer,
    });
  },
  assess: (offerId, assessData) => {
    return axios({
      method: "put",
      url: `/logistic/offers/${offerId}/assess`,
      data: assessData,
    });
  },

  approve: (unique_id, offerId, notes) => {
    return axios({
      method: "put",
      url: `/logistic/offers/${offerId}/approve`,
      data: {
        notes: notes,
        id: unique_id,
      },
    });
  },
  adjust: (unique_id, offerId, notes, adjustPrice, adjustQuantity, allData) => {
    return axios({
      method: "put",
      url: `/logistic/offers/${offerId}/adjust`,
      data: {
        notes: notes,
        adjust_price: adjustPrice,
        id: unique_id,
        commodity_offer_id: allData.commodity_offer_id,
        logistic_offer_id: allData.logistic_offer_id,
        quantity: adjustQuantity,
        type: allData.type,
        terms_of_handover: allData.terms_of_handover,
      },
    });
  },
  reject: (unique_id, offerId, notes, type) => {
    return axios({
      method: "put",
      url: `/logistic/offers/${offerId}/reject`,
      data: {
        notes,
        type,
        id: unique_id,
      },
    });
  },
  splitLoadingTruck: (
    offerId,
    commodity_offer_id,
    logistic_offer_id,
    qty,
    type,
    terms_of_handover,
  ) => {
    return axios({
      method: "put",
      url: `/logistic/offers/${offerId}/split-loading-truck`,
      data: { commodity_offer_id, logistic_offer_id, quantity: qty, type, terms_of_handover },
    });
  },
  splitShip: (offerId, commodity_offer_id, logistic_offer_id, qty, type, terms_of_handover) => {
    return axios({
      method: "put",
      url: `/logistic/offers/${offerId}/split-ship`,
      data: { commodity_offer_id, logistic_offer_id, quantity: qty, type, terms_of_handover },
    });
  },
  splitDischargedTruck: (
    offerId,
    commodity_offer_id,
    logistic_offer_id,
    qty,
    type,
    terms_of_handover,
  ) => {
    return axios({
      method: "put",
      url: `/logistic/offers/${offerId}/split-discharged-truck`,
      data: { commodity_offer_id, logistic_offer_id, quantity: qty, type, terms_of_handover },
    });
  },

  loading: (unique_id, offerId, date) => {
    return axios({
      method: "put",
      url: `/logistic/offers/${offerId}/loading`,
      data: {
        id: unique_id,
        loading_date: date,
      },
    });
  },
  delivery: (unique_id, offerId, date) => {
    return axios({
      method: "put",
      url: `/logistic/offers/${offerId}/deliver`,
      data: { id: unique_id, delivery_date: date },
    });
  },
  inputBL: (unique_id, offerId, bl_number) => {
    return axios({
      method: "put",
      url: `/logistic/offers/${offerId}/input-bl`,
      data: { id: unique_id, bl_number },
    });
  },
  getBR: (po_number, release_num, logOfferId) => {
    let params = {};
    if (po_number) {
      params.po_number = po_number;
    }
    if (release_num) {
      params.release_num = release_num;
    }

    if (logOfferId) {
      params.logistic_offer_id = logOfferId;
    }

    let finalParams = params;

    return axios({
      method: "get",
      url: `/logistic/offers/blanket`,
      params: finalParams,
    });
  },
  putBR: (po_number, release_num, logOfferId) => {
    let params = {};
    if (po_number) {
      params.po_number = po_number;
    }
    if (release_num) {
      params.release_num = release_num;
    }

    if (logOfferId) {
      params.logistic_offer_id = logOfferId;
    }

    let finalParams = params;

    return axios({
      method: "put",
      url: `/logistic/offers/blanket`,
      params: finalParams,
    });
  },
  getGR: (po_number, release_num, logOfferId) => {
    let params = {};
    if (po_number) {
      params.po_number = po_number;
    }
    if (release_num) {
      params.release_num = release_num;
    }
    if (logOfferId) {
      params.logistic_offer_id = logOfferId;
    }

    let finalParams = params;

    return axios({
      method: "get",
      url: `/logistic/offers/received`,
      params: finalParams,
    });
  },
  putGR: (po_number, release_num, logOfferId) => {
    let params = {};
    if (po_number) {
      params.po_number = po_number;
    }
    if (release_num) {
      params.release_num = release_num;
    }
    if (logOfferId) {
      params.logistic_offer_id = logOfferId;
    }
    let finalParams = params;

    return axios({
      method: "put",
      url: `/logistic/offers/received`,
      params: finalParams,
    });
  },
  lockGR: (logOfferId) => {
    let params = {};
    if (logOfferId) {
      params.logistic_offer_id = logOfferId;
    }
    let finalParams = params;
    return axios({
      method: "put",
      url: `/logistic/offers/received/lock`,
      params: finalParams,
    });
  },
  mutuFinal: (cOfferId, id, data) => {
    let params = {};
    if (cOfferId) {
      params.commodity_offer_id = cOfferId;
    }
    if (id) {
      params.id = id;
    }
    let finalParams = params;
    return axios({
      method: "put",
      url: `/logistic/offers/mutu-final`,
      data,
      params: finalParams,
    });
  },
  delivered: (unique_id, offerId, date) => {
    return axios({
      method: "put",
      url: `/logistic/offers/${offerId}/delivered`,
      data: { id: unique_id, delivered_date: date },
    });
  },
  discharged: (unique_id, offerId, date) => {
    return axios({
      method: "put",
      url: `/logistic/offers/${offerId}/discharged`,
      data: { id: unique_id, discharged_date: date },
    });
  },
  inputBAST: (unique_id, offerId, qty_bast) => {
    return axios({
      method: "put",
      url: `/logistic/offers/${offerId}/input-bast`,
      data: { id: unique_id, qty_bast },
    });
  },
  dashboard: (year) => {
    return axios({
      method: "get",
      url: `/logistic/offers/dashboard/${year}`,
    });
  },
  delete: (id) => {
    return axios({
      method: "delete",
      url: `/logistic/offers/${id}`,
    });
  },
};

export default offers;
