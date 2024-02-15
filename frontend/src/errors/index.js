const constructErrObj = (error_code, error_message) => {
  const errObj = { error_code, error_message };
  return {
    get: () => {
      return { ...errObj };
    },
  };
};

const error = {
  // tech error
  UnexpectedError: constructErrObj("F001", "Unexpected error, please try again later"),

  // session error
  SessionExpired: constructErrObj("F101", "Your session has expired, please log in again"),
  SessionStillActive: constructErrObj("F102", "Your session is still active"),

  SomethingWentWrong: constructErrObj("F999", "Something went wrong"),
};

export default error;
