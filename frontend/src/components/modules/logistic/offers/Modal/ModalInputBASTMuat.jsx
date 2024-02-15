import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Modal, Input, DatePicker, InputNumber } from "antd";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import constant from "constant";
import moment from "moment";
import configs from "configs";

function ModalInputBASTMuat(props) {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const { visible, onCancel, onSuccess, unique_id, id } = props;
  console.log("id");
  console.log(id);

  const [processing, setProcessing] = useState(false);

  useEffect(() => {}, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOnSubmit = (values) => {
    setProcessing(true);

    api.logistic.offers
      .inputBAST(unique_id, id, Number(values.qty_bast))
      .then(function (response) {
        form.resetFields();
        onSuccess();
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
        onCancel();
      })
      .finally(function () {
        setProcessing(false);
      });
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      title={t("Input BAST Muat")}
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      style={{ maxWidth: "300px" }}
    >
      <Form form={form} onFinish={handleOnSubmit} initialValues={{ date: moment() }}>
        <Form.Item
          name="qty_bast"
          label={`${t("qty")} GR`}
          rules={[
            {
              required: true,
              message: `${t("required")}`,
            },
          ]}
        >
          <InputNumber
            addonAfter={"MT"}
            style={{ width: "100%" }}
            placeholder={`${t("input")} ${t("quantity")} GR`}
            {...configs.FORM_MONEY_DEFAULT_PROPS}
          />
        </Form.Item>

        <Form.Item className="text-right mb-0">
          <Button type="secondary" className="mr-2" onClick={onCancel}>
            {t("cancel")}
          </Button>
          <Button type="primary" htmlType="submit" loading={processing}>
            {processing ? t("loading") : t("submit")}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModalInputBASTMuat;
