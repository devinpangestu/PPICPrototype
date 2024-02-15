import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Modal, DatePicker, InputNumber } from "antd";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import constant from "constant";
import moment from "moment";
import configs from "configs";

function ModalDelivered(props) {
  const [t] = useTranslation();
  const [form] = Form.useForm();

  const [processing, setProcessing] = useState(false);

  const { visible, onCancel, onSuccess, transaction } = props;

  const todaysDate = moment();
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (firstInputRef.current != null) {
      firstInputRef.current.focus();
    }

    if (transaction) {
      form.setFieldsValue({
        delivered_datetime: moment(),
      });
    }
  }, [visible, form, transaction]);

  const handleOnSubmit = (values) => {
    setProcessing(true);

    let data = {
      qty_final: values.qty_final,
      handover_date: moment(values.handover_date).format(constant.FORMAT_API_DATE),
    };
    if (
      moment(values.delivered_datetime).format(constant.FORMAT_API_DATE) !==
      moment(todaysDate).format(constant.FORMAT_API_DATE)
    ) {
      data.delivered_datetime = moment(values.delivered_datetime).format(constant.FORMAT_API_DATE);
    }
    api.transactions
      .delivered(transaction.id, data)
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
    <Modal title={`${t("setDelivered")}`} open={visible} onCancel={onCancel} footer={null} centered>
      <Form form={form} onFinish={handleOnSubmit} labelCol={{ span: 6 }}>
        <Form.Item
          name="qty_final"
          label={`${t("qtyFinal")}`}
          rules={[{ required: true, message: `${t("please")} ${t("input")} ${t("qtyFinal")}` }]}
        >
          <InputNumber
            ref={firstInputRef}
            style={{ width: "100%" }}
            placeholder={`${t("input")} ${t("qtyFinal")}`}
            {...configs.FORM_MONEY_DEFAULT_PROPS}
          />
        </Form.Item>
        <Form.Item
          name="handover_date"
          label={`${t("handoverDate")}`}
          rules={[{ required: true, message: `${t("please")} ${t("input")} ${t("handoverDate")}` }]}
        >
          <DatePicker
            
            inputReadOnly={true}
          
            // maxDate={deliveredDatetime}
            style={{ width: "100%" }}
            {...utils.FORM_DATEPICKER_PROPS}
          />
        </Form.Item>
        <Form.Item
          name="delivered_datetime"
          label={`${t("deliveredDatetime")}`}
          rules={[
            { required: true, message: `${t("please")} ${t("input")} ${t("deliveredDatetime")}` },
          ]}
        >
          <DatePicker
          
            inputReadOnly={true}
          
            // minDate={handoverDate ? handoverDate : null}
            // maxDate={todaysDate}
            style={{ width: "100%" }}
            {...utils.FORM_DATEPICKER_PROPS}
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

export default ModalDelivered;
