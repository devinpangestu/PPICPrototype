import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import constant from "constant";
import errors from "errors";
import utils from "utils";

// for multiple requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const baseAxios = axios.create({
  baseURL: constant.API_BASE_URL,
  timeout: localStorage.getItem("api_timeout") || 60000,
  headers: {
    "Content-Type": "application/json",
    "X-Request-Id": uuidv4(),
  },
  withCredentials: true,
  transformRequest: [
    function (data, headers) {
      const token = utils.getToken();
      if (token) {
        headers["Authorization"] = token;
      }

      if (headers["Content-Type"] === "multipart/form-data") {
        return data;
      }
      if (data) {
        return { rq_body: data };
      }
    },
    ...axios.defaults.transformRequest,
  ],
});

// baseAxios.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   function (error) {
//     const originalRequest = error.config;
//     console.log(`error API [${error.config.method}] ${error.config.url}, cause: ${error.message}`);

//     const refreshToken = localStorage.getItem(constant.REFRESH_TOKEN);
//     const rfTokenUrlPath = "/login-refresh-token";
//     if (error.response && error.response.status === 401) {
//       // unauthorized
//       if (refreshToken) {
//         if (originalRequest.url === rfTokenUrlPath) {
//           // refresh token 401
//           error.response.data.error = errors.SessionExpired.get();

//           // alert("originalRequest.url === rfTokenUrlPath")
//           // localStorage.clear();
//         } else if (!originalRequest._retry) {
//           // when access token expired, will refresh access token then continue previous call
//           if (isRefreshing) {
//             return new Promise(function (resolve, reject) {
//               failedQueue.push({ resolve, reject });
//             })
//               .then((token) => {
//                 return axios(originalRequest);
//               })
//               .catch((err) => {
//                 return Promise.reject(err);
//               });
//           }

//           originalRequest._retry = true;
//           isRefreshing = true;

//           return new Promise(function (resolve, reject) {
//             baseAxios
//               .post(rfTokenUrlPath, {
//                 refresh_token: refreshToken,
//               })
//               .then((res) => {
//                 const rsBody = res.data.rs_body;

//                 // access token refreshed
//                 localStorage.setItem(constant.ACCESS_TOKEN, rsBody.access_token);
//                 if (refreshToken !== rsBody.refresh_token) {
//                   // refresh token refreshed
//                   localStorage.setItem(constant.REFRESH_TOKEN, rsBody.refresh_token);
//                 }

//                 // console.log("failedQueue: ", failedQueue);
//                 processQueue(null, rsBody.access_token);
//                 resolve(axios(originalRequest));
//               })
//               .catch((err) => {
//                 processQueue(err, null);
//                 reject(err);
//               })
//               .finally(() => {
//                 isRefreshing = false;
//               });
//           });
//         } else {
//           // other unauthorized error
//           error.response.data.error = errors.SessionExpired.get();
//           // alert("other unauthorized error")
//           // localStorage.clear();
//         }
//       } else {
//         // console.log(JSON.stringify(error.response))
//         // alert("no refresh token found")

//         // localStorage.clear();
//         // no refresh token found
//         error.response.data = {
//           error: errors.SessionExpired.get(),
//         };
//       }
//     }
//     return Promise.reject(error);
//   },
// );

export default baseAxios;
