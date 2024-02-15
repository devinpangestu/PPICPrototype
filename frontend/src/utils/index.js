import * as auth from "./auth";
import * as common from "./common";
import * as errors from "./errors";
import * as event from "./event";
import * as number from "./number";
import * as render from "./render";
import * as strings from "./strings";
import * as table from "./table";
import swal from "./swal";
import * as validation from "./validation";
import * as token from "./token";

const utils = {
  ...auth,
  ...common,
  ...errors,
  ...event,
  ...number,
  ...render,
  ...strings,
  ...table,
  swal: swal,
  ...validation,
  ...token,

};

export default utils;

// export const formPercentLimit = (input) => {
//     if (input <= 100) return input;
//   };

//   export const formNumericLimit = (input) => {
//     if (input <= Number.MAX_SAFE_INTEGER) return Number.MAX_SAFE_INTEGER;
//   };
