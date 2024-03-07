import axios from "lib/axios";

const suppliers = {
  list: (search, page_size, page_number, supplierId) => {
    let params = { supplier_id: supplierId };
    if (search) {
      params.search = search;
    }
    if (page_number) {
      params.page_number = page_number;
    }
    if (page_size) {
      params.page_size = page_size;
    }

    return axios({
      method: "get",
      url: `/suppliers`,
      params: params,
    });
  },
  get: (supplier_id) => {
    return axios({
      method: "get",
      url: `/suppliers/${supplier_id}`,
    });
  },
  getAllPODetails: (po_number, sku_code) => {
    return axios({
      method: "get",
      url: `/suppliers/get-all-PO`,
      params: { po_number, sku_code },
    });
  },
  create: (data) => {
    return axios({
      method: "post",
      url: `/suppliers`,
      data: { schedules: data },
    });
  },
  splitSupplier: (id, data) => {
    return axios({
      method: "put",
      url: `/suppliers/split-supplier/${id}`,
      data: { schedules: data },
    });
  },
  edit: (supplier_id, data) => {
    return axios({
      method: "put",
      url: `/suppliers/${supplier_id}`,
      data: data,
    });
  },
  editComplex: (oriData, newData) => {
    return axios({
      method: "put",
      url: `/suppliers/complex-edit`,
      data: { ori_schedules: oriData, schedules: newData },
    });
  },
  closePO: (id) => {
    return axios({
      method: "put",
      url: `/suppliers/close-po/${id}`,
    });
  },
  confirm: (id, isMass) => {
    let params = {};
    if (isMass) params.mass = "true";
    return axios({
      method: "put",
      url: `/suppliers/confirm/${id}`,
      params,
    });
  },
  confirmSelected: (data) => {
    return axios({
      method: "put",
      url: `/suppliers/confirm`,
      data: { schedules: data },
    });
  },
  delete: (id) => {
    return axios({
      method: "delete",
      url: `/suppliers/${id}`,
    });
  },
  histories: (search, page_size, page_number) => {
    let params = {};
    if (search) {
      params.search = search;
    }
    if (page_number) {
      params.page_number = page_number;
    }
    if (page_size) {
      params.page_size = page_size;
    }
    return axios({
      method: "get",
      url: `/suppliers-history`,
      params: params,
    });
  },
  history: (supplierId) => {
    return axios({
      method: "get",
      url: `/suppliers/${supplierId}/history`,
    });
  },
  transactions: (supplierId, page_size, page_number) => {
    let params = {};
    if (page_number) {
      params.page_number = page_number;
    }
    if (page_size) {
      params.page_size = page_size;
    }
    return axios({
      method: "get",
      url: `/suppliers/${supplierId}/transactions`,
      params,
    });
  },
};

export default suppliers;
