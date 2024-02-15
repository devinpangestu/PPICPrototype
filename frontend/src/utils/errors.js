import handler from "handler";
import utils from "utils";

export const getErrMsg = (err) => {
 
  if (
    err &&
    err.response &&
    err.response.data &&
    err.response.data.error &&
    err.response.data.error.error_message
  ) {
    if (err.response.data.error.error_detail) {
      return `${err.response.data.error.error_message}: ${err.response.data.error.error_detail}`;
    } else {
      return err.response.data.error.error_message;
    }
  } else if (err.message) {
    return err.message;
  } else if (err.toString()) {
    return err.toString();
  }
  return "Something went wrong";
};
