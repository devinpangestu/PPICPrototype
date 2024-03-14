import axios from "lib/axios";
import constant from "constant";
import moment from "moment";

const dataExport = {
  xlsx: (export_type, data) => {
    return axios({
      method: "post",
      url: `/export/xlsx`,
      data: { export_type, data },
    });
  },
};

export default dataExport;
