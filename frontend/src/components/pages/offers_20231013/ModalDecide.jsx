import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Modal, InputNumber, Input } from "antd";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import constant from "constant";
import configs from "configs";

function ModalDecide(props) {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const { visible, onCancel, onSuccess, offer, decision } = props;

  const [processing, setProcessing] = useState(false);

  const isBidModal = decision === constant.BID;

  const bidPriceRef = useRef(null);
  const notesRef = useRef(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (isBidModal && bidPriceRef.current != null) {
      bidPriceRef.current.focus();
    } else if (notesRef.current != null) {
      notesRef.current.focus();
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOnSubmit = (values) => {
    console.log("values");
    console.log(values);
    setProcessing(true);

    let reqBody = {
      decision: decision,
      notes: values.notes,
    };
    if (reqBody.decision === constant.BID && values.bid_price) {
      reqBody.bid_price = values.bid_price;
    }
    api.offers
      .decide(offer.id, reqBody)
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
      title={`${utils.upperCaseFirst(decision)} ${t("offer")} `}
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      width={"600px"}
    >
      <Form form={form} onFinish={handleOnSubmit} labelCol={{ span: 6 }}>
        {decision === constant.BID ? (
          <Form.Item
            name="bid_price"
            label={`${t("bidPrice")}`}
            rules={[{ required: true, message: `${t("please")} ${t("input")} ${t("bidPrice")}` }]}
            colon={false}
          >
            <InputNumber
              ref={bidPriceRef}
              addonAfter={"/Kg"}
              style={{ width: "100%" }}
              placeholder={`${t("input")} ${t("bidPrice")}`}
              {...configs.FORM_MONEY_DEFAULT_PROPS}
            />
          </Form.Item>
        ) : null}

        <Form.Item name="notes" label={t("notes")}>
          <Input.TextArea
            ref={notesRef}
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

export default ModalDecide;
