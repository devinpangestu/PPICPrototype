import jwt_decode from "jwt-decode";
// import { api } from "api";
import constant from "constant";
import utils from "utils";
import handler from "handler";
import { api } from "api";
import moment from "moment";

// const getCurrentTimestamp = () => {
//   return Math.floor(Date.now() / 1000);
// };

export const isMobile = () => {
  return window.innerWidth < constant.DESKTOP_MIN_WIDTH;
};

export const getUserInfo = () => {
  const token = localStorage.getItem(constant.ACCESS_TOKEN);
  if (!token) {
    return;
  }

  const userInfo = jwt_decode(token);

  // if (getCurrentTimestamp() > userInfo.exp) {
  //   // token expired
  //   const rfToken = localStorage.getItem("refresh_token");
  //   if (userInfo.stay_logged_in && rfToken) {
  //     // relogin using refresh token
  //     const rqBody = {
  //       refresh_token: rfToken,
  //     };
  //     api.auth
  //       .loginRfToken(rqBody)
  //       .then(function (response) {
  //         const rsBody = response.data.rs_body;
  //         localStorage.setItem(constant.ACCESS_TOKEN, rsBody.access_token);
  //         localStorage.setItem("refresh_token", rsBody.refresh_token);
  //         getUserInfo();
  //       })
  //       .catch(function (error) {
  //         utils.swal.Error({ msg: utils.getErrMsg(error) });
  //       });

  //     return false;
  //   }
  //   return false;
  // }

  return userInfo;
};

export const authorizationCheck = (currUserLogin) => {
  if (new Date().getTime() > currUserLogin.expired_at) {
    utils.swal.Error({
      msg: "User not Authorized, please login again",
      cbFn: () => {
        // alert("ppn failed")
        handler.handleLogoutClick();
        return;
      },
    });
  }
};

export const isAccessTokenValid = (accessToken) => {
  api.auth
    .accessTokenCheck(accessToken)
    .then((response) => {
      const rsBody = response.data.rs_body;
      if (!rsBody.valid) {
        utils.swal.Error({
          msg: "User not Authorized, please login again",
          cbFn: () => {
            handler.handleLogoutClick();
            return;
          },
        });
      }
    })
    .catch((error) => {
      sessionStorage.clear();
      localStorage.clear();
    });
};

export const isSessionTabValid = (sessionToken) => {
  if (sessionToken !== localStorage.getItem(constant.ACCESS_TOKEN)) {
    utils.swal.Error({
      msg: "You're unable to open this page in a new tab",
      cbFn: () => {
        handler.handleLogout();
        return;
      },
    });
  }
};

export const passwordChangedCheck = (currUserLogin) => {
  //check if the password never changed before because of new user
  if (!currUserLogin.password_changed) {
    window.location.replace("/change-password");
    return;
  }

  if (
    moment(currUserLogin.password_changed).add(90, "days").format(constant.FORMAT_API_DATE) <
    moment().format(constant.FORMAT_API_DATE)
  ) {
    window.location.replace("/change-password");
    return;
  }
};

export const getCSRFToken = () => {
  return window.csrfToken;
};
