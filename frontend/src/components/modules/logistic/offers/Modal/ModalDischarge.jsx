import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Modal, Input, DatePicker, InputNumber } from "antd";
import { api } from "api";
import { useTranslation } from "react-i18next";
import utils from "utils";
import constant from "constant";
import moment from "moment";
import configs from "configs";

function ModalDischarge(props) {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const { visible, onCancel, onSuccess, unique_id, id, actualLoading } = props;
  console.log("id");
  console.log(id);

  const [processing, setProcessing] = useState(false);

  useEffect(() => {}, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOnSubmit = (values) => {
    setProcessing(true);

    api.logistic.offers
      .discharged(unique_id, id, moment(values.dateDischarge).format(constant.FORMAT_API_DATE))
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
      title={t("discharge")}
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      style={{ maxWidth: "300px" }}
    >
      <Form form={form} onFinish={handleOnSubmit} initialValues={{ dateDischarge: actualLoading?moment(actualLoading):moment() }}>
        <Form.Item
          name="dateDischarge"
          label={t("date")}
          rules={[
            {
              required: true,
              message: `${t("required")}`,
            },
          ]}
        >
          <DatePicker
            allowClear={false}
            inputReadOnly={true}
            disabledDate={(current) => {
              return current && current < moment(actualLoading);
            }}
            {...utils.FORM_DATEPICKER_PROPS}
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

export default ModalDischarge;
