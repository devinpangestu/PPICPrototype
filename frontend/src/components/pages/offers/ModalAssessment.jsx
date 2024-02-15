import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Modal, Switch, InputNumber, Input } from "antd";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import constant from "constant";
import configs from "configs";

function ModalAssessment(props) {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const { visible, onCancel, onSuccess, offer } = props;

  const [processing, setProcessing] = useState(false);

  const firstInputRef = useRef(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (firstInputRef.current != null) {
      firstInputRef.current.focus();
    }
  }, [visible]);

  const handleOnSubmit = (values) => {
    console.log("values");
    console.log(values);
    setProcessing(true);
    let reqBody = {
      notes: values.notes,
      is_recommended: values.is_recommended,
    };
    if (values.price_recommendation) {
      reqBody.price_recommendation = values.price_recommendation;
    }
    console.log("reqBody");
    console.log(reqBody);
    api.offers
      .assess(offer.id, reqBody)
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

  let initialValues = {
    is_recommended: false,
  };

  return (
    <Modal
      title={t("offerAssessment")}
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      width={"600px"}
    >
      <Form
        form={form}
        onFinish={handleOnSubmit}
        labelCol={{ span: 6 }}
        initialValues={initialValues}
      >
        <Form.Item
          name="notes"
          label={t("notes")}
          rules={[{ required: true, message: `${t("please")} ${t("input")} ${t("notes")}` }]}
        >
          <Input.TextArea
            ref={firstInputRef}
            placeholder={`${t("input")} ${t("notes")}`}
            rows={constant.FORM_TEXT_AREA_ROW}
            maxLength={constant.FORM_TEXT_AREA_LIMIT}
          />
        </Form.Item>

        <Form.Item
          name="price_recommendation"
          label={`${t("priceRecommendation")}`}
          rules={[
            { required: true, message: `${t("please")} ${t("input")} ${t("priceRecommendation")}` },
          ]}
          colon={false}
        >
          <InputNumber
            addonAfter={"/Kg"}
            style={{ width: "100%" }}
            placeholder={`${t("input")} ${t("priceRecommendation")}`}
            {...configs.FORM_MONEY_DEFAULT_PROPS}
          />
        </Form.Item>

        <Form.Item name="is_recommended" label={t("isRecommended")} valuePropName="checked">
          <Switch />
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

export default ModalAssessment;
