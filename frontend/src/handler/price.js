import { api } from "api";
import utils from "utils";
import moment from "moment";
import constant from "constant";

export const getTodaysPriceDalian = (setPageLoading, setTodayPrices, date) => {
  setPageLoading(true);
  const momentDate = date ? moment(date) : moment();
  api.prices.dalian
    .list(momentDate.format(constant.FORMAT_API_DATE))
    .then(function (response) {
      setTodayPrices(response.data.rs_body);
    })
    .catch(function (error) {
      utils.swal.Error({ msg: utils.getErrMsg(error) });
    })
    .finally(function () {
      setPageLoading(false);
    });
};
