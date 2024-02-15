import constant from "constant";
import axios from "lib/axios";

const auth = {
  login: (rqBody) => {
    return axios({
      method: "post",
      url: `/login`,
      data: rqBody,
    });
  },
  logout: () => {
    let rqConfig = {
      method: "post",
      url: `/logout`,
    };
    if (localStorage.getItem(constant.REFRESH_TOKEN)) {
      rqConfig.data = { refresh_token: localStorage.getItem(constant.REFRESH_TOKEN) };
    }

    return axios(rqConfig);
  },
  changePassword: (rqBody) => {
    return axios({
      method: "put",
      url: `/change-password`,
      data: rqBody,
    });
  },
};

export default auth;
