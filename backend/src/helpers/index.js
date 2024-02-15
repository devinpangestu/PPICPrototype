export const successResponse = (req, res, rs_body, code = 200) =>
  res.send({
    code,
    rs_body,
    success: true,
  });

export const successResponseCreated = (req, res, rs_body, code = 201) =>
  res.send({
    code,
    rs_body,
    success: true,
  });

export const errorResponseBadRequest = (req, res, error_message = {}) =>
  res.status(400).json({
    code: 400,
    error: { error_message },
    rs_body: null,
    success: false,
  });

export const errorResponseUnauthorized = (req, res, error_message = {}) =>
  res.status(401).json({
    code: 401,
    error: { error_message },
    rs_body: null,
    success: false,
  });

export const errorResponseForbidden = (req, res, error_message = {}) =>
  res.status(403).json({
    code: 403,
    error: { error_message },
    rs_body: null,
    success: false,
  });

export const errorResponse = (req, res, error_message = {}, code = 500) =>
  res.status(500).json({
    code,
    error: { error_message },
    rs_body: null,
    success: false,
  });

export const validateEmail = (email) => {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const validateFields = (object, fields) => {
  const errors = [];
  fields.forEach((f) => {
    if (!(object && object[f])) {
      errors.push(f);
    }
  });
  return errors.length ? `${errors.join(", ")} are required fields.` : "";
};

export const uniqueId = (length = 16) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
