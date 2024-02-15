import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Modal, InputNumber, Input, Descriptions } from "antd";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import constant from "constant";
import configs from "configs";

function ModalAdjust(props) {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const { visible, onCancel, onSuccess, unique_id, id, data } = props;

  const [processing, setProcessing] = useState(false);

  const adjustPriceRef = useRef(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    adjustPriceRef.current.focus();
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOnSubmit = (values) => {
    setProcessing(true);
    console.log(values);
    api.logistic.offers
      .adjust(unique_id, id, values.notes, values.adjust_price, values.adjust_quantity, data)
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
      title={`${t("adjust")} ${t("offer")} `}
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      style={{ minWidth: "50%" }}
    >
      <Form form={form} onFinish={handleOnSubmit} labelCol={{ span: 6 }}>
        {data && (
          <>
            <Form.Item label={`${t("price")}`} colon={false}>
              <InputNumber
                addonAfter={"/Kg"}
                style={{ width: "100%" }}
                {...configs.FORM_MONEY_DEFAULT_PROPS}
                value={data.price}
                disabled
              />
            </Form.Item>
          </>
        )}
        <Form.Item
          name="adjust_price"
          label={`${t("adjustPrice")}`}
          rules={[{ required: true, message: `${t("please")} ${t("input")} ${t("adjustPrice")}` }]}
          colon={false}
        >
          <InputNumber
            ref={adjustPriceRef}
            addonAfter={"/Kg"}
            style={{ width: "100%" }}
            placeholder={`${t("input")} ${t("adjustPrice")}`}
            {...configs.FORM_MONEY_DEFAULT_PROPS}
          />
        </Form.Item>

        {data && data.type === "discharged_truck" && (
          <>
            <Form.Item label={`${t("quantity")}`} colon={false}>
              <InputNumber
                addonAfter={"MT"}
                style={{ width: "100%" }}
                {...configs.FORM_MONEY_DEFAULT_PROPS}
                value={data.quantity}
                disabled
              />
            </Form.Item>

            <Form.Item
              name="adjust_quantity"
              label={`${t("adjustQuantity")}`}
              rules={[
                { required: true, message: `${t("please")} ${t("input")} ${t("adjustQuantity")}` },
              ]}
              colon={false}
            >
              <InputNumber
                addonAfter={"MT"}
                style={{ width: "100%" }}
                placeholder={`${t("input")} ${t("adjustQuantity")}`}
                {...configs.FORM_MONEY_DEFAULT_PROPS}
              />
            </Form.Item>
          </>
        )}
        <Form.Item name="notes" label={t("notes")}>
          <Input.TextArea
            placeholder={`${t("input")} ${t("notes")}`}
            rows={constant.FORM_TEXT_AREA_ROW}
            maxLength={constant.FORM_TEXT_AREA_LIMIT}
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

export default ModalAdjust;
