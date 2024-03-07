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
  logout: (access_token, user_define) => {
    let rqConfig = {
      method: "post",
      url: `/logout`,
      data: { access_token, user_define },
    };
    if (localStorage.getItem(constant.REFRESH_TOKEN)) {
      rqConfig.data.refresh_token = localStorage.getItem(constant.REFRESH_TOKEN);
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
  accessTokenCheck: (accessToken) => {
    return axios({
      method: "post",
      url: `/token-check`,
      data: { access_token: accessToken },
    });
  },
};

export default auth;
