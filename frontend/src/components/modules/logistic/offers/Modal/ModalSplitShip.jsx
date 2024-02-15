import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Modal, InputNumber, Input, Descriptions } from "antd";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import constant from "constant";
import configs from "configs";

function ModalSplitShip(props) {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const { visible, onCancel, onSuccess, unique_id, id, data } = props;

  const [processing, setProcessing] = useState(false);

  const qtyLoaded = useRef(null);
  console.log(props, "props");
  useEffect(() => {
    if (!visible) {
      return;
    }
    qtyLoaded.current.focus();
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOnSubmit = (values) => {
    setProcessing(true);
    console.log(values);
    api.logistic.offers
      .createFromExisting(id, unique_id, data.terms_of_handover,values.qty_loaded,)
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

    api.logistic.offers
      .splitShip(
        id,
        data.commodity_offer_id,
        data.logistic_offer_id,
        values.qty_loaded,
        data.type,
        data.terms_of_handover,
      )
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

  return (
    <Modal
      title={`${t("Enter")} ${t("Current")} ${t("Loaded")} `}
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      style={{ minWidth: "50%" }}
    >
      <Form form={form} onFinish={handleOnSubmit} labelCol={{ span: 6 }}>
        <Form.Item
          name="qty_loaded"
          label={`${t("qtyLoaded")}`}
          rules={[{ required: true, message: `${t("please")} ${t("input")} ${t("qtyLoaded")}` }]}
          colon={false}
        >
          <InputNumber
            ref={qtyLoaded}
            addonAfter={"Kg"}
            style={{ width: "100%" }}
            placeholder={`${t("input")} ${t("qtyLoaded")}`}
            {...configs.FORM_NUMBER_FORMAT}
          />
        </Form.Item>

        <Form.Item wrapperCol={{ span: 24 }} className="text-right mb-0">
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

export default ModalSplitShip;
