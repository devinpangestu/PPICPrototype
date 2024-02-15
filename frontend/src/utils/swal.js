import swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import i18next from "i18next";
import constant from "constant";
import errors from "errors";

const infoSwal = (type, opt) => {
  let swalOpt = {
    icon: type,
  };

  if (type === "success") {
    swalOpt.title = `${i18next.t("swalDefaultSuccess")}`;
  } else if (type === "error") {
    // swalOpt.title = `${i18next.t("swalDefaultError")}`;
  } else {
    swalOpt.title = `${i18next.t("swalDefaultError")}`;
  }
  if (opt && opt.msg) {
    swalOpt.text = opt.msg;
  }

  if (opt && opt.cbFn !== undefined) {
    swal.fire(swalOpt).then((result) => {
      if (result.isConfirmed || result.dismiss) {
        opt.cbFn();
      }
    });
    return;
  }
  swal.fire(swalOpt);
};

const Error = (opt) => {
  const typeStr = "error";
  if (opt) {
    if (opt.msg && opt.msg === errors.SessionExpired.get().error_message) {
      localStorage.removeItem(constant.ACCESS_TOKEN);
      localStorage.removeItem(constant.REFRESH_TOKEN);
      window.location = import.meta.env.VITE_WEB_BASE_URL + "/login";
      return;
    } else {
      infoSwal(typeStr, opt);
    }
  } else {
    infoSwal(typeStr);
  }
};

const Swal = { Error };

export default Swal;
