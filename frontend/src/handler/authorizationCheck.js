import utils from "utils";
import handler from "handler";

export const checkAuthorization = (userInfo) => {
  if (new Date().getTime() > userInfo.expired_at) {
    utils.swal.Error({
      msg: "User not Authorized, please login again",
      cbFn: () => {
        handler.handleLogout();
      },
    });
  }
};

export const setupAuthorizationCheck = (userInfo) => {
  checkAuthorization(userInfo);
  // Set up an interval to check every 30 seconds
  const intervalId = setInterval(() => {
    checkAuthorization(userInfo);
  }, 30000);
  // Return the interval ID for cleanup
  return intervalId;
};
