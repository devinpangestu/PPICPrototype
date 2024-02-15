import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Modal, InputNumber } from "antd";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import configs from "configs";

function ModalRejectBid(props) {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const { visible, onCancel, onSuccess, offer } = props;

  const [processing, setProcessing] = useState(false);

  const fixedPriceRef = useRef(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (fixedPriceRef.current != null) {
      fixedPriceRef.current.focus();
    }
  }, [visible]);

  const handleOnSubmit = (values) => {
    setProcessing(true);
    let data = {
      fixed_price: values.fixed_price,
    };

    api.offers
      .rejectBid(offer.id, data)
      .then(function (response) {
        form.resetFields();
        onSuccess();
      })
      .catch(function (error) {
        utils.swal.Error({ msg: utils.getErrMsg(error) });
      })
      .finally(function () {
        setProcessing(false);
      });
  };

  return (
    <Modal
      title={`${t("reject")} ${t("bid")}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      width={"600px"}
    >
      <Form form={form} onFinish={handleOnSubmit} labelCol={{ span: 6 }}>
        <Form.Item
          name="fixed_price"
          label={`${t("fixedPrice")}`}
          rules={[{ required: true, message: `${t("please")} ${t("input")} ${t("fixedPrice")}` }]}
          colon={false}
        >
          <InputNumber
            ref={fixedPriceRef}
            addonAfter={"/Kg"}
            style={{ width: "100%" }}
            placeholder={`${t("input")} ${t("fixedPrice")}`}
            {...configs.FORM_MONEY_DEFAULT_PROPS}
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

export default ModalRejectBid;
