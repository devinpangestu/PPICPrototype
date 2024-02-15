import React, { useState, useEffect } from "react";
import { Form, Button, Modal, InputNumber } from "antd";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import configs from "configs";

function ModalInputBL(props, isEdit) {
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
      .inputBL(unique_id, id, Number(values.bl_number))
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
      title={t("Input Quantity Bill of Lading")}
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      style={{ maxWidth: "300px" }}
    >
      <Form form={form} onFinish={handleOnSubmit}>
        <Form.Item
          name="bl_number"
          label={`${t("blQuantity")}`}
          rules={[
            {
              required: true,
              message: `${t("required")}`,
            },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder={`${t("input")} ${t("blQuantity")} `}
            addonAfter={"MT"}
            {...configs.FORM_QUANTITY_DEFAULT_PROPS}
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

export default ModalInputBL;
