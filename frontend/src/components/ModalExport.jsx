import React, { useState } from "react";
import { Form, Button, Modal, DatePicker } from "antd";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import moment from "moment";
import constant from "constant";
import configs from "configs";

function ModalExport(props) {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const { visible, onCancel, exportType, id } = props;

  const [processingExport, setProcessingExport] = useState(false);

  const handleOnSubmit = (values) => {
    const dateFrom = moment(values.date[0]).format(constant.FORMAT_DISPLAY_DATE);
    const dateTo = moment(values.date[1]).format(constant.FORMAT_DISPLAY_DATE);

    setProcessingExport(true);

    api.dataExport
      .xlsx(exportType, dateFrom, dateTo, id)
      .then(function (response) {
        setProcessingExport(false);
        setTimeout(() => {
          utils.openInNewTab(response.data.rs_body.url);
        }, 500);
      })
      .catch(function (error) {
        setProcessingExport(false);
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      });
  };

  return (
    <Modal
      title={`${t("export")} ${utils.snakeToTitleCase(exportType)}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
    >
      <Form form={form} onFinish={handleOnSubmit}>
        <Form.Item
          name="date"
          label={`${t("date")}`}
          rules={[{ required: true, message: `${t("please")} ${t("input")} ${t("date")}` }]}
          wrapperCol={{ flex: "auto" }}
        >
          <DatePicker.RangePicker style={{ width: "100%" }} {...utils.FORM_RANGEPICKER_PROPS} />
        </Form.Item>
        <Form.Item wrapperCol={{ span: 24 }} className="text-right mb-0">
          <Button type="secondary" className="mr-2" onClick={onCancel}>
            {t("cancel")}
          </Button>
          <Button type="primary" htmlType="submit" loading={processingExport}>
            {processingExport ? t("loading") : t("submit")}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModalExport;
