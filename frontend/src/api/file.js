import axios from "lib/axios";

const file = {
  upload: {
    single: (data) => {
      return axios({
        method: "post",
        url: `/files/upload/single`,
        data: data,
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
  },

  delete: (uid, url) => {
    return axios({
      method: "delete",
      url: `/files/delete`,
      data: {
        uid: uid,
        url: url,
      },
    });
  },
};

export default file;
