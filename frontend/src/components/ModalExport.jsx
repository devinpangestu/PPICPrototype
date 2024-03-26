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
  const { visible, onCancel, exportType, data } = props;
  const [processingExport, setProcessingExport] = useState(false);

  const handleOnSubmit = (values) => {
    setProcessingExport(true);
    console.log(exportType);
    api.dataExport
      .xlsx(exportType, data)
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
      title={`${t("export")} ${utils.capitalizeCase(exportType)}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
    >
      <Form form={form} onFinish={handleOnSubmit}>
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
