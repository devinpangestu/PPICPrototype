import axios from "lib/axios";

const roles = {
  list: () => {
    return axios({
      method: "get",
      url: `/roles`,
    });
  },
  get: (id) => {
    return axios({
      method: "get",
      url: `/roles/${id}`,
    });
  },
  create: (role) => {
    return axios({
      method: "post",
      url: `/roles`,
      data: role,
    });
  },
  edit: (id, updatedRole) => {
    return axios({
      method: "put",
      url: `/roles/${id}`,
      data: updatedRole,
    });
  },
  delete: (id) => {
    return axios({
      method: "delete",
      url: `/roles/${id}`,
    });
  },
  editPermissions: (mapPermissions) => {
    return axios({
      method: "put",
      url: `/roles/permissions`,
      data: mapPermissions,
    });
  },
};

export default roles;
