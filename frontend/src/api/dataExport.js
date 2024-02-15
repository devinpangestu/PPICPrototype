import axios from "lib/axios";
import constant from "constant";
import moment from "moment";

const dataExport = {
  xlsx: (export_type, from_date, to_date, id) => {
    let data = {
      export_type: export_type,
      from_date: moment(from_date).format(constant.FORMAT_API_DATE),
      to_date: moment(to_date).format(constant.FORMAT_API_DATE),
    };
    if (id) {
      data.id = id;
    }
    return axios({
      method: "post",
      url: `/export/xlsx`,
      data: data,
    });
  },
};

export default dataExport;
