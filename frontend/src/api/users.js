import axios from "lib/axios";

const users = {
  list: (search, page_size, page_number, ppic_ids) => {
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
    if (ppic_ids && ppic_ids.length > 0) {
      params.ppic_ids = JSON.stringify(ppic_ids);
    }

    return axios({
      method: "get",
      url: `/users`,
      params: params,
    });
  },
  get: (id) => {
    return axios({
      method: "get",
      url: `/users/${id}`,
    });
  },
  create: (user) => {
    return axios({
      method: "post",
      url: `/users`,
      data: user,
    });
  },
  edit: (id, updatedUser) => {
    return axios({
      method: "put",
      url: `/users/${id}`,
      data: updatedUser,
    });
  },
  delete: (id) => {
    return axios({
      method: "delete",
      url: `/users/${id}`,
    });
  },
  resetPwd: (id) => {
    return axios({
      method: "put",
      url: `/users/${id}/reset-pwd`,
    });
  },
  registerOneSignalPlayerID: (player_id) => {
    return axios({
      method: "put",
      url: `/users/register-onesignal`,
      data: { player_id },
    });
  },
};

export default users;
