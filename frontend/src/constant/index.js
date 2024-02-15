import * as api from "./api";
import * as localStorage from "./localStorage";
import * as swal from "./swal";
import * as form from "./form";
import * as common from "./common";
import * as offerStatus from "./offerStatus";
import * as moment from "./moment";
import * as prices from "./prices";
import * as roles from "./roles";
import * as images from "./images";
import * as modal from "./modal";
// import * as logistic from "./logistic";
import * as file from "./file";

const constant = {
  ...api,
  ...localStorage,
  ...swal,
  ...form,
  ...common,
  ...offerStatus,
  ...moment,
  ...prices,
  ...roles,
  ...images,
  ...modal,
  // ...logistic,
  ...file,
};

export default constant;
